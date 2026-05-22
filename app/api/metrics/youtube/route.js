export async function GET() {
  try {
    // Get channel by custom URL
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&forHandle=@itsalgee&type=channel&key=${process.env.YOUTUBE_API_KEY}`
    )
    const searchData = await searchRes.json()
    if (!searchData.items?.[0]) return Response.json({ error: 'Channel not found' }, { status: 404 })

    const channelId = searchData.items[0].snippet.channelId

    // Get channel stats
    const statsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${channelId}&key=${process.env.YOUTUBE_API_KEY}`
    )
    const statsData = await statsRes.json()

    if (!statsData.items?.[0]) {
      return Response.json({ error: 'Stats not found' }, { status: 404 })
    }

    const channel = statsData.items[0]
    return Response.json({
      subscribers: parseInt(channel.statistics.subscriberCount || 0),
      views: parseInt(channel.statistics.viewCount || 0),
      videos: parseInt(channel.statistics.videoCount || 0),
      title: channel.snippet.title,
    })
  } catch (err) {
    console.error('YouTube API error:', err)
    return Response.json({ error: 'Failed to fetch YouTube data' }, { status: 500 })
  }
}
