module.exports = (Discord, client) => {
    client.user.setPresence({
        status: "dnd",
        activity: {
            name: 'minar ramoncitos 💰',
            type: "PLAYING"
        }
    })
    console.log("El bot ta ready");
}
