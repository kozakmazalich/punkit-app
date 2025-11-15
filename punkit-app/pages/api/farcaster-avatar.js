export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    // In a real implementation, you would fetch from Farcaster's API
    // For demo, we'll return a placeholder or use a fallback
    
    // Example: Fetch from Farcaster (commented out for demo)
    /*
    const response = await fetch(`https://api.farcaster.xyz/v1/user?username=${username}`);
    const data = await response.json();
    
    if (data.result && data.result.user) {
      return res.json({
        avatarUrl: data.result.user.avatarUrl,
        username: data.result.user.username
      });
    }
    */
    
    // Fallback: Return a placeholder image
    const placeholderAvatars = [
      'https://i.imgur.com/3QY9PH0.png',
      'https://i.imgur.com/5EXkVSV.png', 
      'https://i.imgur.com/7Uq3K7a.png'
    ];
    
    const randomAvatar = placeholderAvatars[
      Math.floor(Math.random() * placeholderAvatars.length)
    ];
    
    res.json({
      avatarUrl: randomAvatar,
      username: username,
      note: 'This is a demo placeholder. In production, connect to Farcaster API.'
    });
    
  } catch (error) {
    console.error('Error fetching Farcaster avatar:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Farcaster avatar',
      details: error.message 
    });
  }
}