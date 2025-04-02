// Initialize Supabase client
const supabaseUrl = 'https://tdecpfvclvqcqjfyxgnn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkZWNwZnZjbHZxY3FqZnl4Z25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2NTkyNTgsImV4cCI6MjA1ODIzNTI1OH0.EkTjt4HtcQN5qX--PBBPgB8dO49mfIjpJHp_vkFV0-U'
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)

// Function to fetch and display posts
async function fetchPosts() {
    try {
        console.log('Fetching posts...')
        const { data, error } = await supabase
            .from('post')
            .select('*, profile:profile_id(*), media:media_id(*)')
            .order('created_at', { ascending: false })

        if (error) throw error

        const postsContainer = document.getElementById('posts-container')
        postsContainer.innerHTML = '' // Clear existing posts

        data.forEach(post => {
            let postImage = supabase.storage.from(post.media.bucket).getPublicUrl(post.media.file_path)
            const postElement = document.createElement('div')
            postElement.className = 'post'
            postElement.innerHTML = `
                <h3 class="post-title">${post.profile.username}</h3>
                <img src="${postImage.data.publicUrl}" alt="Post Image" class="post-image">
                <div class="post-date">${new Date(post.created_at).toLocaleDateString()}</div>
            `
            postsContainer.appendChild(postElement)
        })
    } catch (error) {
        console.error('Error fetching posts:', error.message)
    }
}

async function fetchSponsors() {
    try {
        const { data, error } = await supabase
            .from('sponsor')
            .select('*, media:logo_media_id(*)')
            .order('sponsor_type', { ascending: true })

        if (error) throw error

        console.log('Sponsors:', data)

        const sponsorsContainer = document.getElementById('sponsors-container')
        sponsorsContainer.innerHTML = '' // Clear existing sponsors
        

        let orderedSponsors = data.sort((a, b) => {
            const typeOrder = { 'TITLE': 1, 'GOLD': 2, 'SILVER': 3 };
            return typeOrder[a.sponsor_type] - typeOrder[b.sponsor_type];
        }).filter(sponsor => sponsor.sponsor_type !== 'BINGO');

        orderedSponsors.forEach(sponsor => {
            let sponsorImage = supabase.storage.from(sponsor.media.bucket).getPublicUrl(sponsor.media.file_path)
            const sponsorElement = document.createElement('div')
            sponsorElement.className = 'sponsor'
            sponsorElement.innerHTML = `
                <span class="sponsor-type ${sponsor.sponsor_type}">${sponsor.sponsor_type}</span>
                <img src="${sponsorImage.data.publicUrl}" alt="${sponsor.name}" class="sponsor-logo">
                <h3 class="sponsor-name">${sponsor.name}</h3>
                <p class="sponsor-description">${sponsor.description}</p>
                <a href="${sponsor.website}" target="_blank" class="sponsor-website">Visit Website</a>
            `
            sponsorsContainer.appendChild(sponsorElement)
        })
    } catch (error) {
        console.error('Error fetching sponsors:', error.message)
    }
}

async function fetchEvents() {
    try {
        const { data, error } = await supabase
            .from('rankboard')
            .select('*, media:logo_media_id(*), derby:derby_id(*), product:product_id(*)')
            .order('created_at', { ascending: false })

        if (error) throw error

        console.log('Rankboards:', data)

        const eventsContainer = document.getElementById('events-container')
        eventsContainer.innerHTML = '' // Clear existing events

        // Group rankboards by derby_id
        const groupedByDerby = {};
        
        data.forEach(rankboard => {
            const derbyId = rankboard.derby_id || 'no_derby';
            if (!groupedByDerby[derbyId]) {
                groupedByDerby[derbyId] = [];
            }
            groupedByDerby[derbyId].push(rankboard);
        });
        
        // Process each derby group
        Object.entries(groupedByDerby).forEach(([derbyId, rankboards]) => {
            // Sort rankboards within each derby by metadata.number if it exists
            rankboards.sort((a, b) => {
                const numA = a.metadata?.number || 0;
                const numB = b.metadata?.number || 0;
                return numA - numB;
            });
            
            // Create a derby section if it's a valid derby
            if (derbyId !== 'no_derby') {
                const derbyName = rankboards[0].derby?.name || 'Derby Event';
                const derbySectionElement = document.createElement('div');
                derbySectionElement.className = 'derby-section';
                
                // Create the title element
                const titleElement = document.createElement('h2');
                titleElement.className = 'derby-title';
                titleElement.textContent = derbyName;
                
                // Create the content container
                const contentElement = document.createElement('div');
                contentElement.className = 'derby-content expanded';
                
                // Add click handler for collapsing/expanding
                titleElement.addEventListener('click', () => {
                    titleElement.classList.toggle('collapsed');
                    contentElement.classList.toggle('collapsed');
                    contentElement.classList.toggle('expanded');
                });
                
                // Add rankboards to the content container
                rankboards.forEach(rankboard => {
                    if (!rankboard.metadata?.name) {
                        return;
                    }
                    
                    const eventElement = document.createElement('div')
                    eventElement.className = 'event'
                    
                    // Get the image URL if media exists
                    let imageUrl = ''
                    if (rankboard.media) {
                        const imageData = supabase.storage.from(rankboard.media.bucket).getPublicUrl(rankboard.media.file_path)
                        imageUrl = imageData.data.publicUrl
                    }

                    // Add number to title if it exists
                    const numberPrefix = rankboard.metadata.number ? `${rankboard.metadata.number}. ` : '';

                    eventElement.innerHTML = `
                        <h3 class="event-title">${numberPrefix}${rankboard.metadata.name || 'Rankboard Event'}</h3>
                        <p class="event-description">
                            ${rankboard.product && rankboard.product.price_cents ? 
                                `Price: $${(rankboard.product.price_cents / 100).toFixed(2)}` : 
                                'Price not available'}
                        </p>
                    `
                    contentElement.appendChild(eventElement)
                });
                
                // Assemble the derby section
                derbySectionElement.appendChild(titleElement);
                derbySectionElement.appendChild(contentElement);
                eventsContainer.appendChild(derbySectionElement);
            }
        });
    } catch (error) {
        console.error('Error fetching events:', error.message)
    }
}


// Fetch data when the page loads
document.addEventListener('DOMContentLoaded', fetchPosts)
document.addEventListener('DOMContentLoaded', fetchSponsors)
document.addEventListener('DOMContentLoaded', fetchEvents)