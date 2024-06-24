import { Low } from "lowdb/lib";
import { JSONFile, JSONFilePreset } from "lowdb/node";

export type GuildSetting = {
  guildId: string;
  fromChannel: string | null;
  toChannel: string | null;
  vips: Array<string>;
  tickets: Array<string>;
};

type GuildSettings = {
  settings: Array<GuildSetting>;
};

const defaultData: GuildSettings = { settings: [] };
export const db = await JSONFilePreset<GuildSettings>("db.json", defaultData);
export async function getOrCreate(guildId: string): Promise<GuildSetting> {
  let guildSettings: GuildSetting | undefined = db.data.settings.find(
    (settings) => settings.guildId == guildId,
  );
  if (guildSettings === undefined) {
    guildSettings = {
      guildId: guildId,
      fromChannel: null,
      toChannel: null,
      vips: [],
      tickets: [],
    };
    await db.update(({ settings }) => settings.push(guildSettings!));
  }
  return guildSettings;
}

export async function updateSetting(setting: GuildSetting) {
  let index = db.data.settings.findIndex((i) => i == setting);
  db.data.settings[index] = setting;
  await db.write();
}
