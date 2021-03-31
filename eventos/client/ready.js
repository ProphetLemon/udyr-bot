module.exports = (Discord, client) => {
    client.user.setPresence({
        status: "dnd",
        activity: {
            name: 'minar <:udyrcoin:825031865395445760>',
            type: "PLAYING"
        }
    })
    console.log("El bot ta ready");
}
