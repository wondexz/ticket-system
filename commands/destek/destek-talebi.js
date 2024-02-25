const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("destek-talebi")
        .setDescription("📩 • Destek kurar")
        .addChannelOption(option =>
            option.setName('kanal')
                .setRequired(true)
                .setDescription('Destek talebinin oluşturulacağı kanal.'))
        .addChannelOption(option =>
            option.setName('log-kanalı')
                .setRequired(true)
                .setDescription('Log kanalınızı seçin'))
                .addRoleOption(option =>
                    option.setName('yetkili')
                        .setRequired(true)
                        .setDescription('Yetkini rolünü seçin')),

    run: async (client, interaction) => {
        if (!(interaction.member.permissions.has(PermissionFlagsBits.Administrator))) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setDescription('Bu komutu kullanma yetkiniz bulunmamaktadır.')
                .setColor('Red')
                .setFooter({ text: `${client.user.username} ©️ Tüm hakları saklıdır.`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const logKanal = interaction.options.getChannel('log-kanalı');
        const yetkiliRol = interaction.options.getRole('yetkili');
        const destekKanal = interaction.options.getChannel('kanal');

        if (db.has(`destekSistemi_${interaction.guild.id}`)) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setDescription('Bu sunucu için zaten bir destek sistemi kurulmuş.')
                .setColor('Red')
                .setFooter({ text: `${client.user.username} ©️ Tüm hakları saklıdır.`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const guild = interaction.guild;

        db.set(`destekSistemi_${interaction.guild.id}`, { log: logKanal.id, yetkili: yetkiliRol.id })

        const embed = new EmbedBuilder()
            .setColor('#2137af')
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setDescription('Destek talebiniz başarıyla kuruldu.')
            .setFooter({ text: `${interaction.user.tag} tarafından istendi.`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('destekolustur')
                    .setLabel('Destek Oluştur')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('1207320322752127026')
            );

        const destekEmbed = new EmbedBuilder()
            .setColor('#2137af')
            .setAuthor({ name: `${guild.name} - Destek Sistemi`, iconURL: guild.iconURL() })
            .setDescription('Aşağıdaki **Destek Oluştur** butonuna tıklayarak destek talebi oluşturabilirsiniz.')
            .setThumbnail(guild.iconURL())
            .setFooter({ text: `${client.user.username} ©️ Tüm hakları saklıdır.`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        const logEmbed = new EmbedBuilder()
            .setAuthor({ name: `${guild.name} - Destek Sistemi`, iconURL: guild.iconURL() })
            .setDescription(`Destek sistemi başarıyla kuruldu.\n\n**•** Destek Kanalı <#${destekKanal.id}>\n**•** Log Kanalı <#${logKanal.id}>\n**•** Yetkili Rol ${yetkiliRol}`)
            .setColor('#2137af')
            .setFooter({ text: `Yetkili: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        await logKanal.send({ embeds: [logEmbed] });
        await destekKanal.send({ embeds: [destekEmbed], components: [row] });
        },
      };