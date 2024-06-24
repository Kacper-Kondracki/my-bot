import {
  AudioPlayerStatus,
  AudioResource,
  createAudioPlayer,
  createAudioResource,
} from "@discordjs/voice";
import _ from "lodash";
import { logger } from "../logger.js";
import fs from "fs/promises";
import path from "path";

async function loadSounds(directory: string): Promise<AudioResource> {
  let files = await fs.readdir(directory);
  let file = _.sample(files)!;
  return createAudioResource(path.join(directory, file));
}

export type soundType = "sound/noTicket" | "sound/ticket" | "sound/vip";

export class AdaSounds {
  player = createAudioPlayer();
  async play(sounds: soundType) {
    const sound = await loadSounds(sounds);
    this.player.play(sound);
    await new Promise<void>((resolve) => {
      const callback = () => {
        this.player.off(AudioPlayerStatus.Idle, callback);
        resolve();
      };
      this.player.on(AudioPlayerStatus.Idle, callback);
    });
  }
}
