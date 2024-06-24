import { Client } from "discordx";
import { logger } from "./logger.js";
import { GuildSetting } from "./storage/db.js";
import {
  PlayerSubscription,
  VoiceConnection,
  joinVoiceChannel,
} from "@discordjs/voice";
import { AdaSounds } from "./player/player.js";
import chalk from "chalk";
import { VoiceChannel, VoiceState } from "discord.js";

export const resetRequest = new Set<string>();
export const currentlyRunning = new Set<string>();

export async function guildHandler(client: Client, setting: GuildSetting) {
  if (setting.fromChannel == null || setting.toChannel == null) {
    return;
  }
  let guild = await client.guilds.fetch(setting.guildId);
  let fromChannel = (await client.channels.fetch(
    setting.fromChannel,
  )) as VoiceChannel;
  let toChannel = (await client.channels.fetch(
    setting.toChannel,
  )) as VoiceChannel;

  let connection: VoiceConnection | null = null;
  let sub: PlayerSubscription | null = null;

  const tasks: Array<boolean> = [];
  const listener = async (oldState: VoiceState, newState: VoiceState) => {
    if (oldState.guild.id != setting.guildId) {
      return;
    }
    if (oldState.member?.user.bot || newState.member?.user.bot) {
      return;
    }

    // if (
    //   oldState.channelId != setting.fromChannel ||
    //   newState.channelId != setting.fromChannel
    // ) {
    //   return;
    // }

    tasks.push(true);
  };
  currentlyRunning.add(setting.guildId);
  while (true) {
    while (tasks.length > 0) {
      tasks.pop();
    }

    try {
      logger.info(
        "Started handler for guild %s",
        chalk.red.underline.bold(guild.name),
      );

      connection = joinVoiceChannel({
        channelId: setting.fromChannel,
        guildId: setting.guildId,
        adapterCreator: guild.voiceAdapterCreator,
      });

      const ada = new AdaSounds();
      sub = connection.subscribe(ada.player)!;

      tasks.push(true);
      client.on("voiceStateUpdate", listener);

      while (true) {
        if (resetRequest.delete(setting.guildId)) {
          break;
        }
        await sleep(100);
        let popped = tasks.pop();
        if (popped) {
          for (const [_, member] of fromChannel.members.filter(
            (member) => !member.user.bot,
          )) {
            logger.info(
              "Handling %s on %s",
              chalk.red.underline.bold(member.displayName),
              chalk.red.underline.bold(guild.name),
            );
            await sleep(500);

            try {
              if (member.roles.cache.hasAny(...setting.vips)) {
                await ada.play("sound/vip");
                await member.voice.setChannel(toChannel);
              } else if (member.roles.cache.hasAny(...setting.tickets)) {
                await ada.play("sound/ticket");
                await member.voice.setChannel(toChannel);
                for (const [_, role] of member.roles.cache) {
                  if (setting.tickets.includes(role.id)) {
                    try {
                      await member.roles.remove(role);
                    } catch {}
                  }
                }
              } else {
                await ada.play("sound/noTicket");
                await member.voice.disconnect();
              }
            } catch {}
          }
        }
      }
    } catch {
      logger.error(
        "Guild handler for server %s crashed",
        chalk.red.underline.bold(guild.name),
      );
    } finally {
      logger.info(
        "Cleaning up handler %s",
        chalk.red.underline.bold(guild.name),
      );
      sub?.unsubscribe();
      connection?.destroy();
      client.off("voiceStateUpdate", listener);
    }
    await sleep(3000);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
