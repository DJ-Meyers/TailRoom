import 'dotenv/config';
import { eq } from 'drizzle-orm';

import { db } from './index';
import { calcEntries, pokemon, speedEntries, teamPokemon, teams } from './schema';

async function resolveUserId(): Promise<string> {
  if (process.env.SEED_USER_ID) {
    return process.env.SEED_USER_ID;
  }

  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  if (!clerkSecretKey) {
    console.error(
      'Error: No SEED_USER_ID set and no CLERK_SECRET_KEY available to look up users.\n' +
        'Set SEED_USER_ID in your .env to your Clerk user ID.',
    );
    process.exit(1);
  }

  console.log('No SEED_USER_ID set. Looking up Clerk users...');
  const res = await fetch('https://api.clerk.com/v1/users?limit=1', {
    headers: { Authorization: `Bearer ${clerkSecretKey}` },
  });

  if (!res.ok) {
    console.error(`Failed to fetch Clerk users: ${res.status} ${res.statusText}`);
    process.exit(1);
  }

  const users = (await res.json()) as Array<{ id: string; username: string | null }>;
  if (users.length === 0) {
    console.error(
      'No users found in Clerk. Sign in to the app first, then re-run the seed.',
    );
    process.exit(1);
  }

  const user = users[0];
  console.log(
    `  Using Clerk user: ${user.username ?? user.id} (${user.id})`,
  );
  return user.id;
}

const defaultEvs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
const defaultIvs = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
const defaultBoosts = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };

async function seed() {
  const userId = await resolveUserId();

  // Idempotency check
  const existing = await db
    .select()
    .from(teams)
    .where(eq(teams.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    console.log(`Seed data already exists for user "${userId}". Skipping.`);
    process.exit(0);
  }

  console.log(`Seeding database for user "${userId}"...`);

  // 1. Create teams
  const [rainTeam, sunTeam, trickRoomTeam] = await db
    .insert(teams)
    .values([
      { userId, name: 'VGC Rain', slug: 'vgc-rain' },
      { userId, name: 'VGC Sun', slug: 'vgc-sun' },
      { userId, name: 'Trick Room', slug: 'trick-room' },
    ])
    .returning();

  console.log(
    `  Created teams: ${rainTeam.name}, ${sunTeam.name}, ${trickRoomTeam.name}`,
  );

  // 2. Create pokemon
  const pokemonData = [
    {
      userId,
      species: 'Pelipper',
      name: 'Pelipper',
      slug: 'pelipper',
      nature: 'Bold',
      ability: 'Drizzle',
      item: 'Damp Rock',
      move: 'Scald',
      level: 50,
      evs: { ...defaultEvs, hp: 252, def: 252, spd: 4 },
      ivs: defaultIvs,
      boosts: defaultBoosts,
    },
    {
      userId,
      species: 'Flutter Mane',
      name: 'Flutter Mane',
      slug: 'flutter-mane',
      nature: 'Timid',
      ability: 'Protosynthesis',
      item: 'Booster Energy',
      move: 'Moonblast',
      level: 50,
      evs: { ...defaultEvs, spa: 252, spe: 252, hp: 4 },
      ivs: defaultIvs,
      boosts: defaultBoosts,
    },
    {
      userId,
      species: 'Urshifu-Rapid-Strike',
      name: 'Urshifu-Rapid-Strike',
      slug: 'urshifu-rapid-strike',
      nature: 'Jolly',
      ability: 'Unseen Fist',
      item: 'Mystic Water',
      move: 'Surging Strikes',
      level: 50,
      evs: { ...defaultEvs, atk: 252, spe: 252, hp: 4 },
      ivs: defaultIvs,
      boosts: defaultBoosts,
    },
    {
      userId,
      species: 'Rillaboom',
      name: 'Rillaboom',
      slug: 'rillaboom',
      nature: 'Adamant',
      ability: 'Grassy Surge',
      item: 'Assault Vest',
      move: 'Grassy Glide',
      level: 50,
      evs: { ...defaultEvs, hp: 252, atk: 252, spd: 4 },
      ivs: defaultIvs,
      boosts: defaultBoosts,
    },
    {
      userId,
      species: 'Incineroar',
      name: 'Incineroar',
      slug: 'incineroar',
      nature: 'Careful',
      ability: 'Intimidate',
      item: 'Safety Goggles',
      move: 'Flare Blitz',
      level: 50,
      evs: { ...defaultEvs, hp: 252, spd: 252, def: 4 },
      ivs: defaultIvs,
      boosts: defaultBoosts,
    },
    {
      userId,
      species: 'Chien-Pao',
      name: 'Chien-Pao',
      slug: 'chien-pao',
      nature: 'Jolly',
      ability: 'Sword of Ruin',
      item: 'Focus Sash',
      move: 'Icicle Crash',
      level: 50,
      evs: { ...defaultEvs, atk: 252, spe: 252, hp: 4 },
      ivs: defaultIvs,
      boosts: defaultBoosts,
    },
  ];

  const insertedPokemon = await db
    .insert(pokemon)
    .values(pokemonData)
    .returning();

  console.log(`  Created ${insertedPokemon.length} pokemon`);

  // 3. Create pokemon for the other two teams
  const sunPokemonData = [
    {
      userId,
      species: 'Torkoal',
      name: 'Torkoal',
      slug: 'torkoal',
      nature: 'Quiet',
      ability: 'Drought',
      item: 'Charcoal',
      move: 'Eruption',
      level: 50,
      evs: { ...defaultEvs, hp: 252, spa: 252, spd: 4 },
      ivs: { ...defaultIvs, spe: 0 },
      boosts: defaultBoosts,
    },
    {
      userId,
      species: 'Venusaur',
      name: 'Venusaur',
      slug: 'venusaur',
      nature: 'Modest',
      ability: 'Chlorophyll',
      item: 'Life Orb',
      move: 'Weather Ball',
      level: 50,
      evs: { ...defaultEvs, spa: 252, spe: 252, hp: 4 },
      ivs: defaultIvs,
      boosts: defaultBoosts,
    },
    {
      userId,
      species: 'Landorus-Therian',
      name: 'Landorus-Therian',
      slug: 'landorus-therian',
      nature: 'Adamant',
      ability: 'Intimidate',
      item: 'Choice Scarf',
      move: 'Earthquake',
      level: 50,
      evs: { ...defaultEvs, atk: 252, spe: 252, hp: 4 },
      ivs: defaultIvs,
      boosts: defaultBoosts,
    },
    {
      userId,
      species: 'Farigiraf',
      name: 'Farigiraf',
      slug: 'farigiraf',
      nature: 'Bold',
      ability: 'Armor Tail',
      item: 'Sitrus Berry',
      move: 'Psychic',
      level: 50,
      evs: { ...defaultEvs, hp: 252, def: 252, spd: 4 },
      ivs: defaultIvs,
      boosts: defaultBoosts,
    },
  ];

  const insertedSunPokemon = await db
    .insert(pokemon)
    .values(sunPokemonData)
    .returning();

  console.log(`  Created ${insertedSunPokemon.length} pokemon for VGC Sun`);

  const trickRoomPokemonData = [
    {
      userId,
      species: 'Dusclops',
      name: 'Dusclops',
      slug: 'dusclops',
      nature: 'Relaxed',
      ability: 'Frisk',
      item: 'Eviolite',
      move: 'Night Shade',
      level: 50,
      evs: { ...defaultEvs, hp: 252, def: 252, spd: 4 },
      ivs: { ...defaultIvs, spe: 0 },
      boosts: defaultBoosts,
    },
    {
      userId,
      species: 'Iron Hands',
      name: 'Iron Hands',
      slug: 'iron-hands',
      nature: 'Brave',
      ability: 'Quark Drive',
      item: 'Assault Vest',
      move: 'Drain Punch',
      level: 50,
      evs: { ...defaultEvs, hp: 252, atk: 252, spd: 4 },
      ivs: { ...defaultIvs, spe: 0 },
      boosts: defaultBoosts,
    },
    {
      userId,
      species: 'Amoonguss',
      name: 'Amoonguss',
      slug: 'amoonguss',
      nature: 'Relaxed',
      ability: 'Regenerator',
      item: 'Rocky Helmet',
      move: 'Pollen Puff',
      level: 50,
      evs: { ...defaultEvs, hp: 252, def: 252, spd: 4 },
      ivs: { ...defaultIvs, spe: 0 },
      boosts: defaultBoosts,
    },
    {
      userId,
      species: 'Torkoal',
      name: 'TR Torkoal',
      slug: 'tr-torkoal',
      nature: 'Quiet',
      ability: 'Drought',
      item: 'Charcoal',
      move: 'Eruption',
      level: 50,
      evs: { ...defaultEvs, hp: 252, spa: 252, spd: 4 },
      ivs: { ...defaultIvs, spe: 0 },
      boosts: defaultBoosts,
    },
  ];

  const insertedTRPokemon = await db
    .insert(pokemon)
    .values(trickRoomPokemonData)
    .returning();

  console.log(
    `  Created ${insertedTRPokemon.length} pokemon for Trick Room`,
  );

  // References to shared pokemon
  const urshifu = insertedPokemon[2]; // shared across all 3 teams
  const rillaboom = insertedPokemon[3]; // shared across Rain + Sun

  // 4. Link pokemon to teams
  // Rain team: all 6 original pokemon
  await db.insert(teamPokemon).values(
    insertedPokemon.map((p, i) => ({
      teamId: rainTeam.id,
      pokemonId: p.id,
      slot: i + 1,
    })),
  );

  // Sun team: Torkoal, Venusaur, Urshifu (shared), Rillaboom (shared), Lando-T, Farigiraf
  await db.insert(teamPokemon).values([
    { teamId: sunTeam.id, pokemonId: insertedSunPokemon[0].id, slot: 1 }, // Torkoal
    { teamId: sunTeam.id, pokemonId: insertedSunPokemon[1].id, slot: 2 }, // Venusaur
    { teamId: sunTeam.id, pokemonId: urshifu.id, slot: 3 }, // Urshifu (shared)
    { teamId: sunTeam.id, pokemonId: rillaboom.id, slot: 4 }, // Rillaboom (shared)
    { teamId: sunTeam.id, pokemonId: insertedSunPokemon[2].id, slot: 5 }, // Lando-T
    { teamId: sunTeam.id, pokemonId: insertedSunPokemon[3].id, slot: 6 }, // Farigiraf
  ]);

  // Trick Room team: Dusclops, Iron Hands, Urshifu (shared), Amoonguss, Torkoal, Rillaboom (shared)
  await db.insert(teamPokemon).values([
    { teamId: trickRoomTeam.id, pokemonId: insertedTRPokemon[0].id, slot: 1 }, // Dusclops
    { teamId: trickRoomTeam.id, pokemonId: insertedTRPokemon[1].id, slot: 2 }, // Iron Hands
    { teamId: trickRoomTeam.id, pokemonId: urshifu.id, slot: 3 }, // Urshifu (shared)
    { teamId: trickRoomTeam.id, pokemonId: insertedTRPokemon[2].id, slot: 4 }, // Amoonguss
    { teamId: trickRoomTeam.id, pokemonId: insertedTRPokemon[3].id, slot: 5 }, // Torkoal
    { teamId: trickRoomTeam.id, pokemonId: rillaboom.id, slot: 6 }, // Rillaboom (shared)
  ]);

  console.log('  Linked pokemon to teams');
  console.log('    Urshifu-Rapid-Strike -> VGC Rain, VGC Sun, Trick Room');
  console.log('    Rillaboom -> VGC Rain, VGC Sun, Trick Room');

  // 5. Create calc entries (2 per pokemon: 1 offensive, 1 defensive)
  const defaultModifiers = {
    teraType: '',
    boosts: defaultBoosts,
    status: 'Healthy',
    isCrit: false,
    abilityOn: false,
    boostedStat: '',
  };

  const calcData = [
    // Pelipper offensive: Scald vs Incineroar
    {
      pokemonId: insertedPokemon[0].id,
      mode: 'offensive',
      sortOrder: 0,
      name: 'Scald vs Incineroar',
      move: 'Scald',
      opponentSpecies: 'Incineroar',
      opponentNature: 'Careful',
      opponentAbility: 'Intimidate',
      opponentItem: 'Safety Goggles',
      opponentEvs: { ...defaultEvs, hp: 252, spd: 252, def: 4 },
      opponentIvs: defaultIvs,
      opponentBoosts: defaultBoosts,
      fieldConditions: { weather: 'Rain' },
      selectedPokemonModifiers: defaultModifiers,
    },
    // Pelipper defensive: Raging Bolt Thunderbolt vs Pelipper
    {
      pokemonId: insertedPokemon[0].id,
      mode: 'defensive',
      sortOrder: 1,
      name: 'Raging Bolt Thunderbolt',
      opponentSpecies: 'Raging Bolt',
      opponentNature: 'Modest',
      opponentAbility: 'Protosynthesis',
      opponentItem: 'Booster Energy',
      opponentMove: 'Thunderbolt',
      opponentEvs: { ...defaultEvs, spa: 252, spe: 252, hp: 4 },
      opponentIvs: defaultIvs,
      opponentBoosts: defaultBoosts,
      fieldConditions: {},
      selectedPokemonModifiers: defaultModifiers,
    },
    // Flutter Mane offensive: Moonblast vs Urshifu
    {
      pokemonId: insertedPokemon[1].id,
      mode: 'offensive',
      sortOrder: 0,
      name: 'Moonblast vs Urshifu',
      move: 'Moonblast',
      opponentSpecies: 'Urshifu-Rapid-Strike',
      opponentNature: 'Jolly',
      opponentAbility: 'Unseen Fist',
      opponentItem: 'Mystic Water',
      opponentEvs: { ...defaultEvs, atk: 252, spe: 252, hp: 4 },
      opponentIvs: defaultIvs,
      opponentBoosts: defaultBoosts,
      fieldConditions: {},
      selectedPokemonModifiers: defaultModifiers,
    },
    // Flutter Mane defensive: Kingambit Sucker Punch
    {
      pokemonId: insertedPokemon[1].id,
      mode: 'defensive',
      sortOrder: 1,
      name: 'Kingambit Sucker Punch',
      opponentSpecies: 'Kingambit',
      opponentNature: 'Adamant',
      opponentAbility: 'Defiant',
      opponentItem: 'Assault Vest',
      opponentMove: 'Sucker Punch',
      opponentEvs: { ...defaultEvs, hp: 252, atk: 252, def: 4 },
      opponentIvs: defaultIvs,
      opponentBoosts: defaultBoosts,
      fieldConditions: {},
      selectedPokemonModifiers: defaultModifiers,
    },
    // Urshifu offensive: Surging Strikes vs Incineroar
    {
      pokemonId: insertedPokemon[2].id,
      mode: 'offensive',
      sortOrder: 0,
      name: 'Surging Strikes vs Incineroar',
      move: 'Surging Strikes',
      opponentSpecies: 'Incineroar',
      opponentNature: 'Careful',
      opponentAbility: 'Intimidate',
      opponentItem: 'Safety Goggles',
      opponentEvs: { ...defaultEvs, hp: 252, spd: 252, def: 4 },
      opponentIvs: defaultIvs,
      opponentBoosts: defaultBoosts,
      fieldConditions: { weather: 'Rain' },
      selectedPokemonModifiers: defaultModifiers,
    },
    // Urshifu defensive: Flutter Mane Moonblast
    {
      pokemonId: insertedPokemon[2].id,
      mode: 'defensive',
      sortOrder: 1,
      name: 'Flutter Mane Moonblast',
      opponentSpecies: 'Flutter Mane',
      opponentNature: 'Timid',
      opponentAbility: 'Protosynthesis',
      opponentItem: 'Booster Energy',
      opponentMove: 'Moonblast',
      opponentEvs: { ...defaultEvs, spa: 252, spe: 252, hp: 4 },
      opponentIvs: defaultIvs,
      opponentBoosts: defaultBoosts,
      fieldConditions: {},
      selectedPokemonModifiers: defaultModifiers,
    },
    // Rillaboom offensive: Grassy Glide vs Urshifu
    {
      pokemonId: insertedPokemon[3].id,
      mode: 'offensive',
      sortOrder: 0,
      name: 'Grassy Glide vs Urshifu',
      move: 'Grassy Glide',
      opponentSpecies: 'Urshifu-Rapid-Strike',
      opponentNature: 'Jolly',
      opponentAbility: 'Unseen Fist',
      opponentItem: 'Mystic Water',
      opponentEvs: { ...defaultEvs, atk: 252, spe: 252, hp: 4 },
      opponentIvs: defaultIvs,
      opponentBoosts: defaultBoosts,
      fieldConditions: { terrain: 'Grassy' },
      selectedPokemonModifiers: defaultModifiers,
    },
    // Rillaboom defensive: Flutter Mane Dazzling Gleam
    {
      pokemonId: insertedPokemon[3].id,
      mode: 'defensive',
      sortOrder: 1,
      name: 'Flutter Mane Dazzling Gleam',
      opponentSpecies: 'Flutter Mane',
      opponentNature: 'Timid',
      opponentAbility: 'Protosynthesis',
      opponentItem: 'Booster Energy',
      opponentMove: 'Dazzling Gleam',
      opponentEvs: { ...defaultEvs, spa: 252, spe: 252, hp: 4 },
      opponentIvs: defaultIvs,
      opponentBoosts: defaultBoosts,
      fieldConditions: {},
      selectedPokemonModifiers: defaultModifiers,
    },
    // Incineroar offensive: Flare Blitz vs Rillaboom
    {
      pokemonId: insertedPokemon[4].id,
      mode: 'offensive',
      sortOrder: 0,
      name: 'Flare Blitz vs Rillaboom',
      move: 'Flare Blitz',
      opponentSpecies: 'Rillaboom',
      opponentNature: 'Adamant',
      opponentAbility: 'Grassy Surge',
      opponentItem: 'Assault Vest',
      opponentEvs: { ...defaultEvs, hp: 252, atk: 252, spd: 4 },
      opponentIvs: defaultIvs,
      opponentBoosts: defaultBoosts,
      fieldConditions: {},
      selectedPokemonModifiers: defaultModifiers,
    },
    // Incineroar defensive: Urshifu Close Combat
    {
      pokemonId: insertedPokemon[4].id,
      mode: 'defensive',
      sortOrder: 1,
      name: 'Urshifu Close Combat',
      opponentSpecies: 'Urshifu-Rapid-Strike',
      opponentNature: 'Jolly',
      opponentAbility: 'Unseen Fist',
      opponentItem: 'Mystic Water',
      opponentMove: 'Close Combat',
      opponentEvs: { ...defaultEvs, atk: 252, spe: 252, hp: 4 },
      opponentIvs: defaultIvs,
      opponentBoosts: defaultBoosts,
      fieldConditions: {},
      selectedPokemonModifiers: defaultModifiers,
    },
    // Chien-Pao offensive: Icicle Crash vs Landorus-Therian
    {
      pokemonId: insertedPokemon[5].id,
      mode: 'offensive',
      sortOrder: 0,
      name: 'Icicle Crash vs Lando-T',
      move: 'Icicle Crash',
      opponentSpecies: 'Landorus-Therian',
      opponentNature: 'Adamant',
      opponentAbility: 'Intimidate',
      opponentItem: 'Choice Scarf',
      opponentEvs: { ...defaultEvs, atk: 252, spe: 252, hp: 4 },
      opponentIvs: defaultIvs,
      opponentBoosts: defaultBoosts,
      fieldConditions: {},
      selectedPokemonModifiers: defaultModifiers,
    },
    // Chien-Pao defensive: Incineroar Flare Blitz
    {
      pokemonId: insertedPokemon[5].id,
      mode: 'defensive',
      sortOrder: 1,
      name: 'Incineroar Flare Blitz',
      opponentSpecies: 'Incineroar',
      opponentNature: 'Adamant',
      opponentAbility: 'Intimidate',
      opponentItem: 'Safety Goggles',
      opponentMove: 'Flare Blitz',
      opponentEvs: { ...defaultEvs, hp: 252, atk: 252, def: 4 },
      opponentIvs: defaultIvs,
      opponentBoosts: defaultBoosts,
      fieldConditions: {},
      selectedPokemonModifiers: defaultModifiers,
    },
  ];

  await db.insert(calcEntries).values(calcData);
  console.log(`  Created ${calcData.length} calc entries`);

  // 6. Create speed entries (common VGC pokemon to compare against)
  const speedData = [
    // Speed entries for Pelipper
    {
      pokemonId: insertedPokemon[0].id,
      sortOrder: 0,
      species: 'Tornadus',
      nature: 'Timid',
      ability: 'Prankster',
      item: 'Focus Sash',
      evs: { ...defaultEvs, spe: 252 },
      ivs: defaultIvs,
      boosts: defaultBoosts,
    },
    {
      pokemonId: insertedPokemon[0].id,
      sortOrder: 1,
      species: 'Amoonguss',
      nature: 'Relaxed',
      ability: 'Regenerator',
      item: 'Rocky Helmet',
      evs: defaultEvs,
      ivs: { ...defaultIvs, spe: 0 },
      boosts: defaultBoosts,
    },
    // Speed entries for Flutter Mane
    {
      pokemonId: insertedPokemon[1].id,
      sortOrder: 0,
      species: 'Chien-Pao',
      nature: 'Jolly',
      ability: 'Sword of Ruin',
      item: 'Focus Sash',
      evs: { ...defaultEvs, spe: 252 },
      ivs: defaultIvs,
      boosts: defaultBoosts,
    },
    {
      pokemonId: insertedPokemon[1].id,
      sortOrder: 1,
      species: 'Ogerpon-Wellspring',
      nature: 'Jolly',
      ability: 'Water Absorb',
      item: 'Wellspring Mask',
      evs: { ...defaultEvs, spe: 252 },
      ivs: defaultIvs,
      boosts: defaultBoosts,
    },
    // Speed entries for Urshifu
    {
      pokemonId: insertedPokemon[2].id,
      sortOrder: 0,
      species: 'Landorus-Therian',
      nature: 'Adamant',
      ability: 'Intimidate',
      item: 'Choice Scarf',
      evs: { ...defaultEvs, spe: 252 },
      ivs: defaultIvs,
      boosts: defaultBoosts,
    },
    {
      pokemonId: insertedPokemon[2].id,
      sortOrder: 1,
      species: 'Flutter Mane',
      nature: 'Timid',
      ability: 'Protosynthesis',
      item: 'Booster Energy',
      evs: { ...defaultEvs, spe: 252 },
      ivs: defaultIvs,
      boosts: defaultBoosts,
    },
    // Speed entries for Rillaboom
    {
      pokemonId: insertedPokemon[3].id,
      sortOrder: 0,
      species: 'Incineroar',
      nature: 'Careful',
      ability: 'Intimidate',
      item: 'Safety Goggles',
      evs: { ...defaultEvs, spe: 4 },
      ivs: defaultIvs,
      boosts: defaultBoosts,
    },
    {
      pokemonId: insertedPokemon[3].id,
      sortOrder: 1,
      species: 'Iron Hands',
      nature: 'Adamant',
      ability: 'Quark Drive',
      item: 'Assault Vest',
      evs: { ...defaultEvs, spe: 4 },
      ivs: defaultIvs,
      boosts: defaultBoosts,
    },
    // Speed entries for Incineroar
    {
      pokemonId: insertedPokemon[4].id,
      sortOrder: 0,
      species: 'Rillaboom',
      nature: 'Adamant',
      ability: 'Grassy Surge',
      item: 'Assault Vest',
      evs: { ...defaultEvs, spe: 4 },
      ivs: defaultIvs,
      boosts: defaultBoosts,
    },
    {
      pokemonId: insertedPokemon[4].id,
      sortOrder: 1,
      species: 'Kingambit',
      nature: 'Adamant',
      ability: 'Defiant',
      item: 'Assault Vest',
      evs: defaultEvs,
      ivs: defaultIvs,
      boosts: defaultBoosts,
    },
    // Speed entries for Chien-Pao
    {
      pokemonId: insertedPokemon[5].id,
      sortOrder: 0,
      species: 'Flutter Mane',
      nature: 'Timid',
      ability: 'Protosynthesis',
      item: 'Booster Energy',
      evs: { ...defaultEvs, spe: 252 },
      ivs: defaultIvs,
      boosts: defaultBoosts,
    },
    {
      pokemonId: insertedPokemon[5].id,
      sortOrder: 1,
      species: 'Raging Bolt',
      nature: 'Modest',
      ability: 'Protosynthesis',
      item: 'Booster Energy',
      evs: { ...defaultEvs, spe: 252 },
      ivs: defaultIvs,
      boosts: defaultBoosts,
    },
  ];

  await db.insert(speedEntries).values(speedData);
  console.log(`  Created ${speedData.length} speed entries`);

  console.log('Seed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
