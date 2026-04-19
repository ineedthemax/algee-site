export async function GET() {
  try {
    const serverId = '1472662811930005514'
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${serverId}`,
      {
        headers: {
          'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        },
      }
    )

    if (!res.ok) {
      console.error('Discord API error:', res.status, res.statusText)
      return Response.json({ error: 'Failed to fetch Discord data' }, { status: 500 })
    }

    const guild = await res.json()
    return Response.json({
      members: guild.member_count,
      name: guild.name,
      icon: guild.icon,
    })
  } catch (err) {
    console.error('Discord API error:', err)
    return Response.json({ error: 'Failed to fetch Discord data' }, { status: 500 })
  }
}
