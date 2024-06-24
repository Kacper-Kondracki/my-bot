import { AudioPlayerStatus, joinVoiceChannel } from "@discordjs/voice";
import {
  ApplicationCommandOptionType,
  Channel,
  Role,
  User,
  VoiceChannel,
  type CommandInteraction,
} from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { AdaSounds } from "../player/player.js";
import { logger } from "../logger.js";
import { channel } from "diagnostics_channel";
import { db, getOrCreate, updateSetting } from "../storage/db.js";

@Discord()
export class Example {
  @Slash({ description: "play" })
  async play(interaction: CommandInteraction): Promise<void> {
    const setting = await getOrCreate(interaction.guildId!);
    if (setting.fromChannel === null || setting.toChannel === null) {
      await interaction.reply({
        ephemeral: true,
        content: "No channels set",
      });
      return;
    } else {
      await interaction.reply({
        ephemeral: true,
        content: "Ok",
      });
    }

    logger.info("Joining voice channel");
    const connection = joinVoiceChannel({
      channelId: setting.fromChannel,
      guildId: setting.guildId,
      adapterCreator: interaction.guild?.voiceAdapterCreator!,
    });
    const ada = new AdaSounds();
    connection.subscribe(ada.player)!;
    logger.info("Playing sound");
    await ada.play("sound/vip");
    logger.info("Finished playing sound");
  }

  @Slash({ name: "set-from-channel", description: "Set from channel" })
  async setFromChannel(
    @SlashOption({
      description: "From",
      name: "voice-channel",
      type: ApplicationCommandOptionType.Channel,
      required: true,
    })
    voiceChannel: Channel,
    interaction: CommandInteraction,
  ): Promise<void> {
    let settings = await getOrCreate(interaction.guildId!);
    if (!(voiceChannel instanceof VoiceChannel)) {
      await interaction.reply({
        ephemeral: true,
        content: "This channel is not a voice channel",
      });
    }
    settings.fromChannel = voiceChannel.id;
    await updateSetting(settings);
    await interaction.reply({
      ephemeral: true,
      content: "OK",
    });
  }
  @Slash({ name: "set-to-channel", description: "Set to channel" })
  async setToChannel(
    @SlashOption({
      description: "To",
      name: "voice-channel",
      type: ApplicationCommandOptionType.Channel,
      required: true,
    })
    voiceChannel: Channel,
    interaction: CommandInteraction,
  ): Promise<void> {
    let settings = await getOrCreate(interaction.guildId!);
    if (!(voiceChannel instanceof VoiceChannel)) {
      await interaction.reply({
        ephemeral: true,
        content: "This channel is not a voice channel",
      });
    }
    settings.toChannel = voiceChannel.id;
    await updateSetting(settings);
    await interaction.reply({
      ephemeral: true,
      content: "OK",
    });
  }

  @Slash({ name: "add-vip", description: "Add vip" })
  async addVip(
    @SlashOption({
      description: "Vip",
      name: "vip",
      type: ApplicationCommandOptionType.Role,
      required: true,
    })
    vip: Role,
    interaction: CommandInteraction,
  ): Promise<void> {
    let settings = await getOrCreate(interaction.guildId!);
    settings.vips.push(vip.id);
    await updateSetting(settings);
    await interaction.reply({
      ephemeral: true,
      content: "OK",
    });
  }

  @Slash({ name: "remove-vip", description: "remove vip" })
  async removeVip(
    @SlashOption({
      description: "Vip",
      name: "vip",
      type: ApplicationCommandOptionType.Role,
      required: true,
    })
    vip: Role,
    interaction: CommandInteraction,
  ): Promise<void> {
    let settings = await getOrCreate(interaction.guildId!);
    settings.vips = settings.vips.filter((v) => v == vip.id);
    await updateSetting(settings);
    await interaction.reply({
      ephemeral: true,
      content: "OK",
    });
  }

  @Slash({ name: "add-ticket", description: "Add ticket" })
  async addTicket(
    @SlashOption({
      description: "Ticket",
      name: "ticket",
      type: ApplicationCommandOptionType.Role,
      required: true,
    })
    ticket: Role,
    interaction: CommandInteraction,
  ): Promise<void> {
    let settings = await getOrCreate(interaction.guildId!);
    settings.tickets.push(ticket.id);
    await updateSetting(settings);
    await interaction.reply({
      ephemeral: true,
      content: "OK",
    });
  }

  @Slash({ name: "remove-ticket", description: "remove ticket" })
  async removeTicket(
    @SlashOption({
      description: "Ticket",
      name: "ticket",
      type: ApplicationCommandOptionType.Role,
      required: true,
    })
    ticket: Role,
    interaction: CommandInteraction,
  ): Promise<void> {
    let settings = await getOrCreate(interaction.guildId!);
    settings.tickets = settings.tickets.filter((v) => v == ticket.id);
    await updateSetting(settings);
    await interaction.reply({
      ephemeral: true,
      content: "OK",
    });
  }

  @Slash({ name: "settings", description: "show settings" })
  async showSettings(interaction: CommandInteraction): Promise<void> {
    let settings = await getOrCreate(interaction.guildId!);
    await interaction.reply({
      ephemeral: true,
      content: JSON.stringify(settings),
    });
  }
}
