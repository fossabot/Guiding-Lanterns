// Screenshot code by Ajam#3536
// Edited for Corona Lanterns by Greep#3022

// require the discord.js module
const { Attachment } = require('discord.js');
const Discord = require('discord.js');

const fs = require('fs');
const supportdbfile = './data/support_db.json'
const episodefile = './data/tangled_episodes.json'

const checkTime = i => i < 10 ? "0" + i : i;
const SCR = 'scr';

function episode_to_filename(epi) {
    const episode = JSON.parse(fs.readFileSync(episodefile, "utf8"))
    const epi_comp = epi.toUpperCase().replace(/S0/, 'S').replace(/E0/, 'E')
    for (epNojson in episode) {
        var epNojson_comp = epNojson.toUpperCase().replace(/S0/, 'S').replace(/E0/, 'E')
        if (epi_comp === epNojson_comp) {
            return episode[epNojson];
        }
    }
}

function video_id_str() {
    const episode = JSON.parse(fs.readFileSync(episodefile, "utf8"))
    const video_ids = [];
    for (epNojson in episode) {
        video_ids.push(epNojson);
    }
    return video_ids.join("\`\n- \`");
}

function scr_msg(message, client, prefix, functiondate, functiontime, cooldowns, getlogchannel) {
    const usage = `\nThe proper usage would be: \n\`${prefix+SCR} <video_id> <timestamp>\`\nThe timestamp may be a number (in seconds), a percentage (eg. \`50%\`) or in a format \`hh:mm:ss.xxx\` (where hours, minutes and milliseconds are optional)\nType \`${prefix+SCR} list\` to get a list of Video IDs`
    const doclink = "https://Guiding-Lanterns.github.io/Guiding-Lanterns/screenshot.html"
    const functioncalledlog = `\n[${functiondate(0)} - ${functiontime(0)}] Function screenshot() called by ${message.author.tag}`
    console.log(functioncalledlog);
    getlogchannel.send(functioncalledlog);
    const args = message.content.split(/ +/).slice(1);
    if (args[0] === 'list') {
        let embed = new Discord.RichEmbed()
        embed.addField("Available video ids are:", `- \`${video_id_str()}\``)
            .addField("More info:", `[See the documentation about screenshots here](${doclink})`)
            .setFooter(`The proper usage would be: "${prefix+SCR} <video_id> <timestamp>"`, `${message.author.displayAvatarURL}`)
        message.reply(embed)
        return;
    }
    if (args.length < 2) {
        let reply = `You didn't provide enough arguments, ${message.author}!`
        message.channel.send(`${reply}${usage}\n\n More info: ${doclink}`);
        return;
    }
    var filename = episode_to_filename(args[0]);
    if (filename === undefined) {
        const invalididlog = `Invalid video ID: ${args[0]}`
        console.log(invalididlog)
        getlogchannel.send(invalididlog)
        let embed = new Discord.RichEmbed()
        embed.setTitle('ERROR!')
            .setColor('#ff0000')
            .addField("I don\'t have that video id!", `Available video ids are:\n- \`${video_id_str()}\``)
            .setThumbnail("https://cdn.pixabay.com/photo/2017/02/12/21/29/false-2061132_960_720.png")
            .setFooter(`Type "${prefix}bug <details of your bug>" to send at the devs`, `${message.author.displayAvatarURL}`)
        message.reply(embed)
        return;
    }
    if (args[1].split(':').some(isNaN) && !('' + args[1]).match(/^[\d.]+%$/)) {
        const invalidtimestamplog = `Invalid Timestamp: ${args[1]}`
        console.log(invalidtimestamplog)
        getlogchannel.send(invalidtimestamplog)
        let reply = `That is not a valid timestamp, ${message.author}!`
        message.channel.send(`${reply}${usage}\n\n More info: ${doclink}`);
        return;
    }
    message.channel.startTyping()
    console.log(filename);
    getlogchannel.send(filename);

    //Implement cooldown
    if (!cooldowns.has(prefix + SCR)) {
        cooldowns.set(prefix + SCR, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(prefix + SCR);
    const cooldownAmount = 60 * 1000; // 60 seconds cooldown

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            const cooldownlog = `COOLDOWN : Wait ${timeLeft} sec`
            console.log(cooldownlog);
            getlogchannel.send(cooldownlog);
            return message.reply(`please wait ${timeLeft.toFixed(0)} more second(s) before reusing the \`${prefix+SCR}\` command.`)
            .then(m=>message.channel.stopTyping(true));
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);


    if (message.member.roles.find(r => r.name === "KEY (The Guiding Lanterns)")) { //Override cooldown
        timestamps.delete(message.author.id);
    }
    // End of cooldown implement

    const supportdb = JSON.parse(fs.readFileSync(supportdbfile, "utf8"))
    const donor = supportdb[message.author.id]
    if (donor) {
        upload_scr_png(message, filename, args[1], args[0], prefix, getlogchannel);
    } else {
        upload_scr_jpg(message, filename, args[1], args[0], prefix, getlogchannel);
    }
}

function upload_scr_png(message, filename, timemark, displayid, prefix, getlogchannel) {
    const ffmpeg = require('fluent-ffmpeg');
    ffmpeg(filename)
        .on('end', function() {
            const scrtakenlog = '[PNG] Screenshots taken, sending...'
            console.log(scrtakenlog);
            getlogchannel.send(scrtakenlog);
            const attachment = new Attachment('./data/screenshot.png');
            message.channel.send(`${message.author}\nScreenshot of ${displayid} taken at ${timemark}`, attachment)
            .then(m=>message.channel.stopTyping(true));
        })
        .on('error', function(err) {
            const errlog = 'an error happened: ' + err.message
            console.log(errlog);
            getlogchannel.send(errlog);
            let embed = new Discord.RichEmbed()
            embed.setTitle('ERROR!')
                .setColor('#ff0000')
                .addField("Screenshot Error :", `Error during screenshot`)
                .setThumbnail("https://cdn.pixabay.com/photo/2017/02/12/21/29/false-2061132_960_720.png")
                .setFooter(`Type "${prefix}bug <details of your bug>" to send at the devs`, `${message.author.displayAvatarURL}`)
            message.reply(embed)
        })
        .screenshots({
            timestamps: [timemark],
            filename: 'screenshot.png',
            folder: './data',
        });

}

function upload_scr_jpg(message, filename, timemark, displayid, prefix, getlogchannel) {
    const ffmpeg = require('fluent-ffmpeg');
    ffmpeg(filename)
        .on('end', function() {
            const scrtakenlog = '[JPG] Screenshots taken, sending...'
            console.log(scrtakenlog);
            getlogchannel.send(scrtakenlog);
            const attachment = new Attachment('./data/screenshot.jpg');
            message.channel.send(`${message.author}\nScreenshot of ${displayid} taken at ${timemark}`, attachment)
            .then(m=>message.channel.stopTyping(true));
        })
        .on('error', function(err) {
            const errlog = 'an error happened: ' + err.message
            console.log(errlog);
            getlogchannel.send(errlog);
            let embed = new Discord.RichEmbed()
            embed.setTitle('ERROR!')
                .setColor('#ff0000')
                .addField("Screenshot Error :", `Error during screenshot`)
                .setThumbnail("https://cdn.pixabay.com/photo/2017/02/12/21/29/false-2061132_960_720.png")
                .setFooter(`Type "${prefix}bug <details of your bug>" to send at the devs`, `${message.author.displayAvatarURL}`)
            message.reply(embed)
        })
        .screenshots({
            timestamps: [timemark],
            filename: 'screenshot.jpg',
            folder: './data',
        });

}

function screenshot(message, client, prefix, functiondate, functiontime, cooldowns, getlogchannel, dbl) {
    if (message.content.startsWith(prefix + SCR)) {
        scr_msg(message, client, prefix, functiondate, functiontime, cooldowns, getlogchannel);
    }
};

module.exports = screenshot;