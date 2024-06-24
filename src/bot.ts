import type { CommandInteraction, Interaction, Message } from "discord.js";
import { Guild, IntentsBitField } from "discord.js";
import { Client, GuardFunction } from "discordx";
import { logger } from "./logger.js";
import { joinVoiceChannel } from "@discordjs/voice";
import chalk from "chalk";
import { db } from "./storage/db.js";
import { guildHandler } from "./guildHandler.js";

const Log: GuardFunction<CommandInteraction> = async (
  arg: CommandInteraction,
  _,
  next,
) => {
  logger.info(
    "User %s invoked command: %s",
    chalk.magenta.underline.bold(arg.user.displayName),
    chalk.red.underline.bold(arg.commandName),
  );
  await next();
};

export const bot = new Client({
  // To use only guild command
  botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.MessageContent,
  ],
  guards: [Log],
  silent: true,
});

bot.once("ready", () => {
  // await bot.guilds.fetch();
  void bot.initApplicationCommands();
  //  await bot.clearApplicationCommands(
  //    ...bot.guilds.cache.map((g) => g.id)
  //  );

  db.data.settings.forEach((setting) => {
    guildHandler(bot, setting);
  });

  logger.info("Bot started");
});

bot.on("interactionCreate", (interaction: Interaction) => {
  bot.executeInteraction(interaction);
});

bot.on("messageCreate", (message: Message) => {
  void bot.executeCommand(message);
});
