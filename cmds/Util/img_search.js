const Discord = require('discord.js')
const fs = require('fs')
const configfile = "./data/config.json";
const config = JSON.parse(fs.readFileSync(configfile, "utf8"));

const GImages = require('google-images');
const GoogleImages = new GImages(config.googleimage_CSEID, config.googleimage_APIKEY);

const min=0; 
const max=9;

function image_search(message, client, prefix, functiondate, functiontime, getlogchannel) {
    try{
    let args = message.content.split(" ");
    args.shift();
    if (args.length < 1) return message.channel.send(`__Input your search!__\nExample: \`${prefix}googleimage Chris Sonnenburg\``);

    var random = Math.random() * (+max - +min) + +min;

    GoogleImages.search(args.join(" "))
    .then(image => {
        var imgurl = image[random.toFixed(0)].url;
        var parentpageurl = image[random.toFixed(0)].parentPage;
        let embed = new Discord.RichEmbed()
        embed.setAuthor(`Here is a picture of ${args.join(" ")}`, message.author.displayAvatarURL, parentpageurl)
        .setImage(imgurl)
        .setColor('RANDOM')
        .setFooter(`Picture ${random.toFixed(0)}/10`);
        message.channel.send(embed)
    }, undefined)
    .catch(err=> {
        message.reply('Hmm... Something went wrong. Don\'t worry, the report has been send!');
        const errmsg = `Google Image Search Error: ${err}`;
        console.log(`[${functiondate(0)} - ${functiontime(0)}] ${errmsg}`);
        getlogchannel().send(errmsg);
    }, undefined)

    } catch(err) {
        message.reply('Hmm... Something went wrong. Don\'t worry, the report has been send!');
        const errmsg = `Google Image Search Error: ${err}`;
        console.log(`[${functiondate(0)} - ${functiontime(0)}] ${errmsg}`);
        getlogchannel().send(errmsg);
    }    
}


function image_search_request(message, client, prefix, functiondate, functiontime, getlogchannel, dbl) {
    if (message.content.startsWith(prefix + 'googleimage')) {
    if (client.user.id == '577477992608038912') return image_search(message, client, prefix, functiondate, functiontime, getlogchannel);
    
    image_search(message, client, prefix, functiondate, functiontime, getlogchannel);

    /*
    dbl.hasVoted(message.author.id).then(voted => {
        if (voted) {
            image_search(message, client, prefix, functiondate, functiontime, getlogchannel);
        } else {
            let embed = new Discord.RichEmbed()
            embed.setTitle('ERROR!')
            .setColor('#ff0000')
            .addField("This command is vote locked!", `Have you voted for the bot?\nVoting for the bot keeps the dev. of the bot alive :wink:\n\nhttps://discordbots.org/bot/569624646475972608/vote \n\n(Synchronization with the vote and bot can take about 5 minutes, you can check if you voted with \`${prefix}didivote\`)`)
            .setFooter(`Type "${prefix}bug <details of your bug>" to send at the devs`, `${message.author.displayAvatarURL}`)
            message.channel.send(embed)
        }
    });
    */
    }
}

module.exports = image_search_request;