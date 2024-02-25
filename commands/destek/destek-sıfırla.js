const { MessageActionRow, MessageSelectMenu, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("destek-sıfırla")
        .setDescription("📩 • Destek sistemini sıfırlar"),

        run: async (client, interaction) => {
            if(db.get(`destekSistemi_${interaction.guild.id}`)) {
                db.delete(`destekSistemi_${interaction.guild.id}`)
                db.delete(`destekSıra_${interaction.guild.id}`)
                const embed = new EmbedBuilder()
                .setColor("Green")
                .setAuthor({ name: `${interaction.user.username} - Başarılı`, iconURL: interaction.user.avatarURL() })
                .setDescription(`Başarıyla destek sistemini sıfırladım!`)
                interaction.reply({
                    embeds: [embed]
                })
            } else {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setColor("Red")
                        .setAuthor({ name: `${interaction.user.username} - Hata`, iconURL: interaction.user.avatarURL() })
                        .setDescription(`Destek sistemi zaten kurulu değil.`)
                        .setFooter({ text: "Kurmak için: /ticket_ayarla" })
                    ]
                })
            }
    },
};
