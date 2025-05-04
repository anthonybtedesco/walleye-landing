// Initialize Supabase client
const supabaseUrl = 'https://tdecpfvclvqcqjfyxgnn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkZWNwZnZjbHZxY3FqZnl4Z25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2NTkyNTgsImV4cCI6MjA1ODIzNTI1OH0.EkTjt4HtcQN5qX--PBBPgB8dO49mfIjpJHp_vkFV0-U'
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)

// Single array to store all mixed data
let allContentData = [];

// Track loading progress
let dataLoaded = {
    submissions: false,
    sponsors: false,
    boards: false
};

// DOM elements
const column1 = document.getElementById('column1');
const column2 = document.getElementById('column2');
const column3 = document.getElementById('column3');
const logoOverlay = document.getElementById('logo-overlay');
const loadingContainer = document.getElementById('loading-container');

// Store cached rankings to avoid multiple API calls for the same board
const rankingsCache = {};

// Function to check if all data is loaded
function checkAllDataLoaded() {
    if (dataLoaded.submissions && dataLoaded.sponsors && dataLoaded.boards) {
        setTimeout(() => {
            // Mix all data and split into three different arrays
            shuffleArray(allContentData);
            
            // Split data into three different arrays
            const totalItems = allContentData.length;
            const splitPoint1 = Math.floor(totalItems / 3);
            const splitPoint2 = Math.floor(totalItems * 2 / 3);
            
            // Create three distinct data sets
            const dataSet1 = allContentData.slice(0, splitPoint1);
            const dataSet2 = allContentData.slice(splitPoint1, splitPoint2);
            const dataSet3 = allContentData.slice(splitPoint2);
            
            // Create repeated arrays for each column
            const repeatedData1 = createRepeatedArray(dataSet1);
            const repeatedData2 = createRepeatedArray(dataSet2);
            const repeatedData3 = createRepeatedArray(dataSet3);
            
            // Populate columns with different data
            populateColumn(column1, repeatedData1);
            populateColumn(column2, repeatedData2);
            populateColumn(column3, repeatedData3);
            
            // Hide logo overlay and show content
            logoOverlay.style.opacity = '0';
            
            // Show content
            loadingContainer.classList.add('loaded');
            
            setTimeout(() => {
                // Ensure animations are properly synchronized
                const columns = document.querySelectorAll('.column-inner');
                columns.forEach(col => {
                    // Reset animation to ensure they all start at the same time
                    col.style.animation = 'none';
                    col.offsetHeight; // Trigger reflow
                });
                
                // Set all columns to scroll down
                columns.forEach(col => {
                    col.style.animation = 'scroll-down 300s linear infinite';
                });
                
                // Start logo overlays after content is loaded
                setupLogoOverlay();
            }, 1000);
        }, 2000); // Give a moment for progress to complete
    }
}

// Function to fetch submissions
async function fetchSubmissions() {
    try {
        const { data, error } = await supabase
            .from('submission')
            .select('*, media:media_id(*), hero_media:hero_media_id(*)')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        // Process submission media
        data.forEach(submission => {
            if (submission.media) {
                const mediaUrl = supabase.storage.from(submission.media.bucket).getPublicUrl(submission.media.file_path);
                allContentData.push({
                    type: 'image',
                    url: mediaUrl.data.publicUrl,
                    label: submission.fish_type,
                    source: 'submission'
                });
            }
            
            if (submission.hero_media) {
                const heroUrl = supabase.storage.from(submission.hero_media.bucket).getPublicUrl(submission.hero_media.file_path);
                allContentData.push({
                    type: 'image',
                    url: heroUrl.data.publicUrl,
                    label: submission.fish_type,
                    source: 'submission'
                });
            }
        });
        
        // Mark submissions as loaded
        dataLoaded.submissions = true;
        checkAllDataLoaded();
    } catch (error) {
        console.error('Error fetching submissions:', error.message);
        dataLoaded.submissions = true; // Mark as loaded even if error
        checkAllDataLoaded();
    }
}

// Function to fetch sponsors
async function fetchSponsors() {
    try {
        const { data, error } = await supabase
            .from('sponsor')
            .select('*, media:logo_media_id(*)')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Process sponsor logos
        data.forEach(sponsor => {
            if (sponsor.media) {
                const logoUrl = supabase.storage.from(sponsor.media.bucket).getPublicUrl(sponsor.media.file_path);
                allContentData.push({
                    type: 'image',
                    url: logoUrl.data.publicUrl,
                    label: sponsor.name,
                    source: 'sponsor'
                });
            }
        });
        
        // Mark sponsors as loaded
        dataLoaded.sponsors = true;
        checkAllDataLoaded();
    } catch (error) {
        console.error('Error fetching sponsors:', error.message);
        dataLoaded.sponsors = true; // Mark as loaded even if error
        checkAllDataLoaded();
    }
}

// Function to fetch rankboards/boards
async function fetchBoards() {
    try {
        const { data, error } = await supabase
            .from('rankboard')
            .select('*, media:logo_media_id(*), derby:derby_id(*)')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Fetch the top rankings for each board
        for (const board of data) {
            if (board.metadata?.name) {
                // Fetch top 5 submissions for this board
                const rankings = await fetchTopSubmissions(board.id, 5);
                
                // Create board data with rankings
                allContentData.push({
                    type: 'board',
                    rankboard: board,
                    rankings: rankings,
                    source: 'board'
                });
            }
        }
        
        // Mark boards as loaded
        dataLoaded.boards = true;
        checkAllDataLoaded();
    } catch (error) {
        console.error('Error fetching boards:', error.message);
        dataLoaded.boards = true; // Mark as loaded even if error
        checkAllDataLoaded();
    }
}

// Function to fetch top submissions for a rankboard
async function fetchTopSubmissions(rankboardId, limit) {
    try {
        // Check if we already fetched this data
        if (rankingsCache[rankboardId]) {
            return rankingsCache[rankboardId];
        }
        
        // First get the rankboard to check the species
        const { data: rankboardData, error: rankboardDataError } = await supabase
            .from('rankboard')
            .select('*')
            .eq('id', rankboardId)
            .single();
        
        if (rankboardDataError) throw rankboardDataError;
        
        const rankboardSpecies = rankboardData.species;
        
        // Get rankboard submissions which link rankboard to submissions
        const { data: rankboardSubmissions, error: rankboardError } = await supabase
            .from('rankboard_submission')
            .select('*, submission:submission_id(*)')
            .eq('rankboard_id', rankboardId)
            .eq('verified', 'APPROVED');
        
        if (rankboardError) throw rankboardError;
        
        if (!rankboardSubmissions || rankboardSubmissions.length === 0) {
            // Cache empty results
            rankingsCache[rankboardId] = [];
            return [];
        }
        
        // Extract submission IDs
        const submissionIds = rankboardSubmissions.map(rs => rs.submission_id);
        
        // Fetch the actual submissions with profile data
        const { data: submissions, error: submissionsError } = await supabase
            .from('submission')
            .select('*, profile:profile_id(*)')
            .in('id', submissionIds);
        
        if (submissionsError) throw submissionsError;
        
        // Combine with rankboard submission data
        const combinedData = [];
        rankboardSubmissions.forEach(rs => {
            const submission = submissions.find(s => s.id === rs.submission_id);
            if (submission) {
                // Check if submission matches rankboard species
                if (!rankboardSpecies || rankboardSpecies === 'All' || submission.fish_type === rankboardSpecies) {
                    combinedData.push({
                        ...submission,
                        rankboard_submission: rs
                    });
                }
            }
        });
        
        // Sort by fish length, largest first
        const sortedSubmissions = [...combinedData].sort((a, b) => b.fish_length - a.fish_length);
        
        // Limit to requested number
        const topSubmissions = sortedSubmissions.slice(0, limit);
        
        // Cache the results
        rankingsCache[rankboardId] = topSubmissions;
        
        return topSubmissions;
    } catch (error) {
        console.error(`Error fetching submissions for rankboard ${rankboardId}:`, error.message);
        return [];
    }
}

// Function to generate a ghost name based on submission id
function generateGhostName(id) {
    const ghostId = id.substring(0, 4);
    const ghostNames = ['Specter', 'Phantom', 'Shadow', 'Spirit', 'Ghost', 'Wraith', 'Mist', 'Blur', 'Fog', 'Enigma'];
    const ghostIndex = Math.abs(ghostId.split('').reduce((a, b) => a + b.charCodeAt(0), 0) % ghostNames.length);
    return `${ghostNames[ghostIndex]}${ghostId}`;
}

// Function to create a repeated array that's large enough for smooth scrolling
function createRepeatedArray(array) {
    // If array is empty, add a default item
    if (array.length === 0) {
        array.push({
            type: 'text',
            text: 'WalleyeFest',
            species: 'Loading...',
            source: 'default'
        });
    }
    
    // Calculate how many copies we need to fill the column
    // Each item is 250px, we want to fill at least 300% of viewport height
    const viewportHeight = window.innerHeight;
    const totalHeightNeeded = viewportHeight * 3;
    const itemsNeeded = Math.ceil(totalHeightNeeded / 250);
    
    // Create a repeated array with enough copies
    let result = [];
    while (result.length < itemsNeeded) {
        result = [...result, ...array];
    }
    
    return result;
}

// Function to populate a column with items
function populateColumn(column, dataArray) {
    // Clear existing content
    column.innerHTML = '';
    
    // Create items
    dataArray.forEach((item) => {
        if (item.type === 'image') {
            const itemElement = document.createElement('div');
            itemElement.className = 'item';
            
            const img = document.createElement('img');
            img.src = item.url;
            img.alt = item.label || 'Image';
            img.loading = 'lazy';
            itemElement.appendChild(img);
            
            column.appendChild(itemElement);
        } else if (item.type === 'text') {
            const itemElement = document.createElement('div');
            itemElement.className = 'item';
            
            itemElement.innerHTML = `
                <div style="text-align: center; padding: 20px; height: 100%; display: flex; flex-direction: column; justify-content: center; background-color: rgba(0,0,0,0.2);">
                    <h3 style="font-size: 1.5rem; margin-bottom: 10px; color: white;">${item.text}</h3>
                    <p style="font-size: 1.1rem; color: var(--wf-accent);">${item.species}</p>
                </div>
            `;
            
            column.appendChild(itemElement);
        } else if (item.type === 'board') {
            // Create leaderboard format for board items
            const board = item.rankboard;
            const rankings = item.rankings || [];
            const boardElement = document.createElement('div');
            boardElement.className = 'board-item';
            
            // Determine if this is a payout leaderboard
            if (board.is_main) {
                boardElement.classList.add('main-payout');
            } else {
                boardElement.classList.add('non-main-payout');
            }
            
            // Add number to title if it exists
            const numberPrefix = board.metadata.number ? `${board.metadata.number}. ` : '';
            
            // Get the payouts badge
            const payoutBadge = board.is_main ? 
                `<div class="payout-badge">💰 TOP 25 PAYOUTS</div>` : 
                `<div class="payout-badge">💰 TOP 3 PAYOUTS</div>`;
            
            // Create the rankings table HTML
            let rankingsHTML = '';
            if (rankings.length > 0) {
                rankingsHTML = `
                    <div class="top-rankings">
                        <h4>Top Anglers</h4>
                        <table class="top-rankings-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Angler</th>
                                    <th>Length</th>
                                </tr>
                            </thead>
                            <tbody>
                `;
                
                rankings.forEach((submission, index) => {
                    // Add medal icons for top 3
                    let medalIcon = '';
                    if (index === 0) medalIcon = '<span class="medal-icon">🥇</span> ';
                    else if (index === 1) medalIcon = '<span class="medal-icon">🥈</span> ';
                    else if (index === 2) medalIcon = '<span class="medal-icon">🥉</span> ';
                    
                    // Generate username display
                    let usernameDisplay = '';
                    if (submission.profile && submission.profile.username) {
                        usernameDisplay = `<span class="user-name">🎣 ${submission.profile.username}</span>`;
                    } else {
                        // Use a generic angler name
                        const anglerId = submission.id.substring(0, 4);
                        usernameDisplay = `<span class="user-name">🎣 Angler${anglerId}</span>`;
                    }
                    
                    // Add special class for top 3 ranks
                    const rankClass = index < 3 ? ` class="rank-${index + 1}"` : '';
                    
                    rankingsHTML += `
                        <tr${rankClass}>
                            <td>${index + 1}</td>
                            <td>${medalIcon}${usernameDisplay}</td>
                            <td class="rank-length">${submission.fish_length}"</td>
                        </tr>
                    `;
                });
                
                // Add placeholder rows if less than 5
                for (let i = rankings.length; i < 5; i++) {
                    rankingsHTML += `
                        <tr>
                            <td>${i + 1}</td>
                            <td>--</td>
                            <td class="rank-length">--</td>
                        </tr>
                    `;
                }
                
                rankingsHTML += `
                            </tbody>
                        </table>
                    </div>
                `;
            } else {
                rankingsHTML = `
                    <div class="top-rankings">
                        <h4>Top Anglers</h4>
                        <p style="text-align: center; color: #777; font-style: italic;">No submissions yet</p>
                    </div>
                `;
            }
            
            boardElement.innerHTML = `
                ${payoutBadge}
                <div class="leaderboard-header">
                    <h3 class="leaderboard-title">${numberPrefix}${board.metadata.name}</h3>
                    <div class="leaderboard-species">
                        <span class="fish-icon">🎣</span>${board.species || 'All Species'}
                    </div>
                </div>
                <div class="leaderboard-body">
                    <div class="leaderboard-details">
                        <div class="leaderboard-detail">
                            <span class="detail-label">Type:</span> ${board.type_ || 'Standard'}
                        </div>
                        <div class="leaderboard-detail">
                            <span class="detail-label">Species:</span> ${board.species || 'All'}
                        </div>
                        ${board.is_main ? 
                        `<div class="leaderboard-detail">
                            <span class="detail-label">Payout Places:</span> 25
                        </div>` : 
                        `<div class="leaderboard-detail">
                            <span class="detail-label">Radius:</span> ${board.radius} mi
                        </div>
                        <div class="leaderboard-detail">
                            <span class="detail-label">Payout Places:</span> 3
                        </div>`}
                    </div>
                    ${rankingsHTML}
                </div>
            `;
            
            column.appendChild(boardElement);
        }
    });
}

// Function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Function to preload logo image
function preloadLogo() {
    const logoImg = new Image();
    logoImg.src = "https://tdecpfvclvqcqjfyxgnn.supabase.co/storage/v1/object/public/public-images//walleyefesttrans.png";
    
    const oswegoImg = new Image();
    oswegoImg.src = "https://tdecpfvclvqcqjfyxgnn.supabase.co/storage/v1/object/public/public-images//oswegotrans.png";
    
    const bobJohnsonImg = new Image();
    bobJohnsonImg.src = "https://tdecpfvclvqcqjfyxgnn.supabase.co/storage/v1/object/public/public-images//bobjohnsontrans.png";
}

// Function to show the logo overlay periodically
function setupLogoOverlay() {
    const showLogoOverlay = () => {
        // Update the logo overlay content for periodic displays (without loading dots)
        logoOverlay.innerHTML = `
            <div class="logo-container">
                <img src="https://tdecpfvclvqcqjfyxgnn.supabase.co/storage/v1/object/public/public-images//walleyefesttrans.png" alt="WalleyeFest" class="logo-image">
            </div>
            <img src="https://tdecpfvclvqcqjfyxgnn.supabase.co/storage/v1/object/public/public-images//oswegotrans.png" alt="Oswego" class="corner-image top-right">
            <img src="https://tdecpfvclvqcqjfyxgnn.supabase.co/storage/v1/object/public/public-images//bobjohnsontrans.png" alt="Bob Johnson" class="corner-image bottom-right">
        `;
        
        logoOverlay.style.opacity = '1';
        
        setTimeout(() => {
            logoOverlay.style.opacity = '0';
        }, 3000);
    };
    
    // Show logo overlay every minute
    const scheduleNextOverlay = () => {
        const delay = 30000; // 30 seconds = 1/2 minute
        setTimeout(() => {
            showLogoOverlay();
            scheduleNextOverlay();
        }, delay);
    };
    
    // Start schedule after a delay
    setTimeout(() => {
        scheduleNextOverlay();
    }, 100);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Set up initial loading screen with logo and company images
    logoOverlay.innerHTML = `
        <div class="logo-container">
            <img src="https://tdecpfvclvqcqjfyxgnn.supabase.co/storage/v1/object/public/public-images//walleyefesttrans.png" alt="WalleyeFest" class="logo-image">
            <div class="loading-dots">
                <span class="dot">.</span>
                <span class="dot">.</span>
                <span class="dot">.</span>
            </div>
        </div>
        <img src="https://tdecpfvclvqcqjfyxgnn.supabase.co/storage/v1/object/public/public-images//oswegotrans.png" alt="Oswego" class="corner-image top-right">
        <img src="https://tdecpfvclvqcqjfyxgnn.supabase.co/storage/v1/object/public/public-images//bobjohnsontrans.png" alt="Bob Johnson" class="corner-image bottom-right">
    `;
    
    // Start loading data
    preloadLogo();
    fetchSubmissions();
    fetchSponsors();
    fetchBoards();
}); 