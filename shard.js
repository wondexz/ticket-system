const { ShardingManager, WebhookClient, EmbedBuilder } = require('discord.js');
const chalk = new require('chalk');
const { token, shard: totalShards, webhook: url } = require("./config.json");
const kullanıcıAdı = "Ailght - Shard";
let wb;

if (url) {
    try {
        wb = new WebhookClient({ url });
    } catch (e) {
        console.error('Webhook oluşturulamadı:', e);
    }
}

const manager = new ShardingManager('bot.js', { token, respawn: true, totalShards });

manager.on('shardCreate', shard => {
    console.log(chalk.green(`[SHARD SYSTEM] `) + chalk.red(`#${shard.id} ID'li shard başarıyla başlatıldı`));
    if (wb) {
        shard.on("disconnect", () => {
            wb.send({ embeds: [new EmbedBuilder().setAuthor( { name: 'wondexz'} ).setFooter( { text:'wondexz tarafından geliştirildi' } ).setDescription(`<a:loader:1157978520354566194> ** \`#${shard.id}\` • ID'li shardın bağlantısı koptu, yeniden başlatılmayı deniyor**`).setColor("Red")] });
        });
        shard.on("reconnecting", () => {
            wb.send({ embeds: [new EmbedBuilder().setAuthor( { name: 'wondexz'} ).setFooter( { text:'wondexz tarafından geliştirildi' } ).setDescription(`<a:loader:1157978520354566194> ** \`#${shard.id}\` • ID'li shard yeniden başlatılıyor**`).setColor("Yellow")] });
        });
        shard.on("ready", async () => {
            wb.send({ embeds: [new EmbedBuilder().setAuthor( { name: 'wondexz'} ).setFooter( { text:'wondexz tarafından geliştirildi' } ).setDescription(`<:online:1167915040578482328> ** \`#${shard.id}\` • ID'li shard başarıyla başlatıldı**`).setColor("Green")] });
        });
        shard.on("death", () => {
            wb.send({ embeds: [new EmbedBuilder().setAuthor( { name: 'wondexz'} ).setFooter( { text:'wondexz tarafından geliştirildi' } ).setDescription(`<a:loader:1157978520354566194> ** \`#${shard.id}\` • ID'li shardın bağlantısı koptu, yeniden başlatılmayı deniyor**`).setColor("Red")] });
        });
        shard.on("error", (err) => {
            wb.send({ embeds: [new EmbedBuilder().setAuthor( { name: 'wondexz'} ).setFooter( { text:'wondexz tarafından geliştirildi' } ).setDescription(`<:offline:1167915038850433084> **‼️ \`#${shard.id}\` • ID'li shard'a bir hata oluştu\n\n• ${err}**`).setColor("Red")] });
        });
    }
});

manager.spawn().then(() => {
    if (wb) wb.send({ embeds: [new EmbedBuilder().setDescription(`**Bütün shard'lar başarıyla başlatıldı ve kullanıma hazır**`).setColor("DarkPurple")] });
    console.log(chalk.green(`[SHARD SYSTEM] `) + chalk.red(`Bot Aktif Edildi !`));
});
