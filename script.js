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

// Fetch posts when the page loads
document.addEventListener('DOMContentLoaded', fetchPosts) 