
import 'dotenv/config';

import mongoose from 'mongoose';

import { extractPageText, sanitizePage } from '../common/security/page-content';
import { Person, PersonSchema } from '../modules/people/person.schema';
import { Site, SiteSchema } from '../modules/sites/site.schema';
import { Visit, VisitSchema, VisitSource } from '../modules/visits/visit.schema';

const people = [
  'Aleeza',
  'Sara',
  'Omar',
  'Hina',
  'Bilal',
];

const pages = [
  {
    address: 'tidepool.zz',
    title: 'The Living Tidepool',
    author: 'Aleeza',
    html: `<h1>The Living Tidepool</h1>
      <p>A tidepool is a small world shaped by the rhythm of the sea. When the tide retreats, water remains trapped between rocks, creating a temporary home for marine life.</p>
      <p>Crabs move between crevices while sea anemones wait for passing food. Small fish use these pools as shelter from larger predators.</p>
      <p>Continue reading about the <a href="lighthouse.zz">coastal lighthouse</a> and the <a href="kelp.zz">kelp forest</a>.</p>
      <p>Some visitors also follow a <a href="ghost.zz">missing coastal record</a>.</p>`,
  },
  {
    address: 'lighthouse.zz',
    title: 'The Coastal Lighthouse',
    author: 'Aleeza',
    html: `<h1>The Coastal Lighthouse</h1>
      <p>For generations, coastal lighthouses have helped ships identify dangerous shorelines. Their beams provide a fixed point of reference during dark nights and difficult weather.</p>
      <p>Keepers once maintained lamps, polished lenses and recorded weather conditions. Modern systems automate much of this work, but the buildings remain important landmarks.</p>
      <p>Explore the <a href="kelp.zz">nearby kelp forest</a> or return to the <a href="tidepool.zz">tidepool guide</a>.</p>`,
  },
  {
    address: 'kelp.zz',
    title: 'Inside a Kelp Forest',
    author: 'Aleeza',
    html: `<h1>Inside a Kelp Forest</h1>
      <p>Kelp forests grow in cool, nutrient-rich coastal waters. Their tall brown algae create underwater habitats that support fish, sea otters, invertebrates and many other organisms.</p>
      <p>Strong currents carry nutrients through the forest. Sunlight reaches the upper canopy, where kelp grows rapidly under suitable conditions.</p>
      <p>Read about the <a href="saltcellar.zz">harbour salt trade</a> or visit the <a href="tidepool.zz">tidepool guide</a>.</p>`,
  },
  {
    address: 'saltcellar.zz',
    title: 'The Harbour Salt Cellar',
    author: 'Omar',
    html: `<h1>The Harbour Salt Cellar</h1>
      <p>Salt has long been an important part of coastal trade. Before refrigeration, it helped preserve fish and other foods for journeys between distant ports.</p>
      <p>Harbour warehouses stored salt in dry conditions and distributed it to fishing communities. The trade connected local producers with merchants and sailors.</p>
      <p>Visit the <a href="harbourbakery.zz">harbour bakery</a> or read the <a href="stormwatch.zz">storm watch notes</a>.</p>`,
  },
  {
    address: 'harbourbakery.zz',
    title: 'A Bakery by the Harbour',
    author: 'Omar',
    html: `<h1>A Bakery by the Harbour</h1>
      <p>Small harbour bakeries often begin work before sunrise. Bread is prepared early so that fishermen, dock workers and market sellers can collect breakfast before the day becomes busy.</p>
      <p>Local recipes reflect the ingredients available in each town. Some bakeries keep handwritten records of seasonal changes and customer favourites.</p>
      <p>Learn about <a href="saltcellar.zz">traditional salt storage</a> and the <a href="tidetables.zz">daily tide tables</a>.</p>`,
  },
  {
    address: 'stormwatch.zz',
    title: 'Storm Watch Field Notes',
    author: 'Hina',
    html: `<h1>Storm Watch Field Notes</h1>
      <p>Coastal weather can change quickly. Observers record wind direction, cloud movement, rainfall and changes in sea conditions to understand approaching storms.</p>
      <p>Reliable observations help coastal communities prepare boats, protect equipment and share warnings with neighbouring settlements.</p>
      <p>Compare these notes with the <a href="tidetables.zz">tide tables</a> and the <a href="lighthouse.zz">lighthouse records</a>.</p>`,
  },
  {
    address: 'tidetables.zz',
    title: 'Understanding Tide Tables',
    author: 'Hina',
    html: `<h1>Understanding Tide Tables</h1>
      <p>Tide tables estimate the times and heights of high and low water. They help boat operators, researchers and beach visitors plan activities safely.</p>
      <p>Local geography influences tidal patterns. Always use information for the correct coastal location and check current safety notices.</p>
      <p>Read the <a href="stormwatch.zz">storm watch notes</a> or explore <a href="cartography.zz">coastal mapmaking</a>.</p>`,
  },
  {
    address: 'fieldnotes.zz',
    title: 'Field Notes from the Shore',
    author: 'Sara',
    html: `<h1>Field Notes from the Shore</h1>
      <p>Field notes preserve observations that might otherwise be forgotten. Researchers record dates, locations, conditions and details about the plants and animals they encounter.</p>
      <p>Repeated observations make it easier to notice seasonal patterns and changes in a habitat.</p>
      <p>Explore <a href="cartography.zz">coastal cartography</a> and the <a href="driftwood.zz">driftwood collection</a>.</p>`,
  },
  {
    address: 'cartography.zz',
    title: 'Coastal Cartography',
    author: 'Sara',
    html: `<h1>Coastal Cartography</h1>
      <p>Maps help people understand the relationship between land, water and settlements. Coastal maps may include harbours, reefs, navigation markers and changing shorelines.</p>
      <p>Older maps are useful historical records, while modern surveys provide more precise measurements for navigation and planning.</p>
      <p>Return to the <a href="fieldnotes.zz">shore field notes</a> or visit the <a href="tidepool.zz">tidepool guide</a>.</p>`,
  },
  {
    address: 'driftwood.zz',
    title: 'The Driftwood Collection',
    author: 'Bilal',
    html: `<h1>The Driftwood Collection</h1>
      <p>Driftwood is carried by rivers, waves and currents before collecting along beaches. Its shape and texture can reveal how water and weather have acted on the wood over time.</p>
      <p>Some coastal communities reuse driftwood for practical objects and artwork. Collecting should always respect local environmental rules.</p>
      <p>Read the <a href="fieldnotes.zz">shore field notes</a> or follow this <a href="lostlight.zz">unavailable archive</a>.</p>`,
  },
];

const visitTrail: {
  person: string;
  address: string;
  via: VisitSource;
  found: boolean;
  minute: number;
}[] = [
  { person: 'Sara', address: 'tidepool.zz', via: VisitSource.TYPED, found: true, minute: 0 },
  { person: 'Sara', address: 'lighthouse.zz', via: VisitSource.LINK, found: true, minute: 3 },
  { person: 'Sara', address: 'kelp.zz', via: VisitSource.LINK, found: true, minute: 6 },
  { person: 'Sara', address: 'saltcellar.zz', via: VisitSource.LINK, found: true, minute: 9 },
  { person: 'Sara', address: 'harbourbakery.zz', via: VisitSource.LINK, found: true, minute: 12 },
  { person: 'Sara', address: 'saltcellar.zz', via: VisitSource.BACK, found: true, minute: 15 },
  { person: 'Sara', address: 'stormwatch.zz', via: VisitSource.LINK, found: true, minute: 18 },
  { person: 'Sara', address: 'tidetables.zz', via: VisitSource.LINK, found: true, minute: 21 },
  { person: 'Sara', address: 'cartography.zz', via: VisitSource.LINK, found: true, minute: 24 },
  { person: 'Sara', address: 'fieldnotes.zz', via: VisitSource.LINK, found: true, minute: 27 },
  { person: 'Sara', address: 'driftwood.zz', via: VisitSource.LINK, found: true, minute: 30 },
  { person: 'Sara', address: 'tidepool.zz', via: VisitSource.HISTORY, found: true, minute: 33 },
  { person: 'Sara', address: 'ghost.zz', via: VisitSource.LINK, found: false, minute: 36 },
  { person: 'Aleeza', address: 'tidepool.zz', via: VisitSource.TYPED, found: true, minute: 39 },
  { person: 'Aleeza', address: 'lighthouse.zz', via: VisitSource.LINK, found: true, minute: 42 },
  { person: 'Aleeza', address: 'kelp.zz', via: VisitSource.LINK, found: true, minute: 45 },
  { person: 'Omar', address: 'saltcellar.zz', via: VisitSource.TYPED, found: true, minute: 48 },
  { person: 'Omar', address: 'harbourbakery.zz', via: VisitSource.LINK, found: true, minute: 51 },
  { person: 'Hina', address: 'stormwatch.zz', via: VisitSource.TYPED, found: true, minute: 54 },
  { person: 'Hina', address: 'tidetables.zz', via: VisitSource.LINK, found: true, minute: 57 },
  { person: 'Bilal', address: 'driftwood.zz', via: VisitSource.TYPED, found: true, minute: 60 },
];

async function seed() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI is missing from the backend .env file.');
  }

  await mongoose.connect(mongoUri);

  const PersonModel =
    mongoose.models[Person.name] ??
    mongoose.model(Person.name, PersonSchema);

  const SiteModel =
    mongoose.models[Site.name] ??
    mongoose.model(Site.name, SiteSchema);

  const VisitModel =
    mongoose.models[Visit.name] ??
    mongoose.model(Visit.name, VisitSchema);

  for (const name of people) {
    await PersonModel.updateOne(
      { name },
      { $setOnInsert: { name } },
      { upsert: true },
    );
  }

  for (const page of pages) {
    const html = sanitizePage(page.html);

    await SiteModel.updateOne(
      { address: page.address },
      {
        $set: {
          title: page.title,
          html,
          text: extractPageText(html),
          author: page.author,
        },
        $setOnInsert: {
          address: page.address,
          createdAt: new Date('2026-11-03T09:00:00.000Z'),
        },
      },
      { upsert: true },
    );
  }

  await VisitModel.deleteMany({ seeded: true });

  const startTime = new Date('2026-11-03T09:00:00.000Z');

  await VisitModel.insertMany(
    visitTrail.map((visit) => ({
      person: visit.person,
      address: visit.address,
      via: visit.via,
      found: visit.found,
      at: new Date(startTime.getTime() + visit.minute * 60_000),
      seeded: true,
    })),
  );

  console.log(`Seed complete: ${people.length} people, ${pages.length} websites, ${visitTrail.length} visits.`);
}

seed()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
