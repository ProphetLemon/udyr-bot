module.exports = (Discord, client) => {
    client.user.setPresence({
        status: "dnd",
        activity: {
            name: 'vuestas conversaciones ',
            type: "LISTENING"
        }
    })
    //init_campeones();
    console.log("El bot ta ready");

}
