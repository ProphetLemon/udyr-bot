module.exports = async function handleClean(message, args) {
    if (!message.member.permissions.has('ManageMessages')) {
        return message.reply('Necesitas permiso de **Gestionar mensajes** para usar este comando.');
    }
    if (!message.guild.members.me.permissions.has('ManageMessages')) {
        return message.reply('Necesito permiso de **Gestionar mensajes** para borrar mensajes.');
    }

    let amount = parseInt(args[0], 10);
    if (isNaN(amount) || amount < 1) {
        return message.reply('Debes escribir un numero valido mayor que 0. Ejemplo: `udyr clean 5`');
    }
    if (amount > 100) {
        return message.reply('No puedo borrar mas de 100 mensajes a la vez.');
    }

    // +1 para incluir el propio mensaje del comando
    amount = amount + 1;

    try {
        const deleted = await message.channel.bulkDelete(amount, true);
        const msg = await message.channel.send(`Borrados **${deleted.size - 1}** mensajes.`);
        setTimeout(() => msg.delete().catch(() => {}), 3000);
    } catch (err) {
        console.error('[CLEAN] Error:', err.message);
        message.reply('No pude borrar los mensajes. Asegurate de que no tengan mas de 14 dias de antiguedad.');
    }
};
