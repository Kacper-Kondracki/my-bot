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
import {
  currentlyRunning,
  guildHandler,
  resetRequest,
} from "../guildHandler.js";
import { bot } from "../bot.js";

@Discord()
export class Example {
  @Slash({ name: "set-from-channel", description: "Set from voice channel" })
  async setFromChannel(
    @SlashOption({
      description: "From voice channel",
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
  @Slash({ name: "set-to-channel", description: "Set to voice channel" })
  async setToChannel(
    @SlashOption({
      description: "To voice channel",
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

  @Slash({ name: "add-vip", description: "Add vip role" })
  async addVip(
    @SlashOption({
      description: "Vip role to add",
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

  @Slash({ name: "remove-vip", description: "Remove vip role" })
  async removeVip(
    @SlashOption({
      description: "Vip role to remove",
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

  @Slash({ name: "add-ticket", description: "Add ticket role" })
  async addTicket(
    @SlashOption({
      description: "Ticket role to add",
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

  @Slash({ name: "remove-ticket", description: "Remove ticket role" })
  async removeTicket(
    @SlashOption({
      description: "Ticket role to remove",
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

  @Slash({
    name: "add-permanent-ticket",
    description: "Add permanent ticket role",
  })
  async addPermanentTicket(
    @SlashOption({
      description: "Permanent ticket role to add",
      name: "ticket",
      type: ApplicationCommandOptionType.Role,
      required: true,
    })
    ticket: Role,
    interaction: CommandInteraction,
  ): Promise<void> {
    let settings = await getOrCreate(interaction.guildId!);
    settings.permanentTickets.push(ticket.id);
    await updateSetting(settings);
    await interaction.reply({
      ephemeral: true,
      content: "OK",
    });
  }

  @Slash({
    name: "remove-permanent-ticket",
    description: "Remove permanent ticket role",
  })
  async removePermanentTicket(
    @SlashOption({
      description: "Permanent ticket role to remove",
      name: "ticket",
      type: ApplicationCommandOptionType.Role,
      required: true,
    })
    ticket: Role,
    interaction: CommandInteraction,
  ): Promise<void> {
    let settings = await getOrCreate(interaction.guildId!);
    settings.permanentTickets = settings.permanentTickets.filter(
      (v) => v == ticket.id,
    );
    await updateSetting(settings);
    await interaction.reply({
      ephemeral: true,
      content: "OK",
    });
  }

  @Slash({ name: "settings", description: "Shows settings" })
  async showSettings(interaction: CommandInteraction): Promise<void> {
    let settings = await getOrCreate(interaction.guildId!);
    await interaction.reply({
      ephemeral: true,
      content: JSON.stringify(settings),
    });
  }

  @Slash({ name: "restart", description: "Restarts ADA for the server" })
  async reset(interaction: CommandInteraction): Promise<void> {
    resetRequest.add(interaction.guildId!);
    if (!currentlyRunning.has(interaction.guildId!)) {
      guildHandler(bot, await getOrCreate(interaction.guildId!));
    }
    await interaction.reply({
      ephemeral: true,
      content: "OK",
    });
  }
}
