import 'dotenv/config';

import mongoose from 'mongoose';

import {
  extractPageText,
  sanitizePage,
} from '../common/security/page-content';
import { Person, PersonSchema } from '../modules/people/person.schema';
import { Site, SiteSchema } from '../modules/sites/site.schema';
import {
  Visit,
  VisitSchema,
  VisitSource,
} from '../modules/visits/visit.schema';

const people = ['Aleeza', 'Sara', 'Omar', 'Hina', 'Bilal'];

const seedPages = [
  {
    address: 'tidepool.zz',
    title: 'The Living Tidepool',
    author: 'Aleeza',
    html: `
      <div class="site-tidepool" style="background-color:#edf7f4;color:#193d39;font-family:Georgia,serif;padding:30px;line-height:1.8;">
        <header style="background-color:#174f49;color:#f4fff9;padding:42px 30px;border-radius:18px;margin-bottom:30px;">
          <p style="color:#a9d9c9;text-transform:uppercase;letter-spacing:4px;font-size:12px;">COASTAL FIELD JOURNAL · ISSUE 01</p>
          <h1 style="font-size:42px;line-height:1.15;margin:12px 0;">The Living Tidepool</h1>
          <p style="font-size:17px;color:#d5eee4;">A closer look at the miniature worlds hidden between the tides.</p>
          <p style="font-size:12px;color:#a9d9c9;">WORDS AND OBSERVATIONS BY ALEEZA</p>
        </header>
        <main>
          <section style="margin-bottom:28px;">
            <h2 style="font-size:27px;color:#17675c;">A world between two worlds</h2>
            <p>A tidepool is more than a hollow in a rock. When the ocean retreats, small pockets of seawater remain behind, creating temporary habitats for creatures that must adapt to changing temperatures, light and oxygen.</p>
            <p>Look closely and the pool becomes a living landscape. Tiny snails move across its edges, sea anemones wait beneath the surface, and small fish search for shelter among the stones.</p>
          </section>
          <section style="background-color:#d5ebe2;padding:24px;border-radius:14px;margin:26px 0;">
            <p style="font-size:12px;letter-spacing:2px;color:#28685c;text-transform:uppercase;">FIELD OBSERVATION</p>
            <h2 style="margin-top:5px;color:#174f49;">A changing habitat</h2>
            <p>Even a shallow pool can experience dramatic changes. Sunlight warms exposed water, while incoming waves bring fresh oxygen and nutrients.</p>
          </section>
          <section style="border-left:4px solid #58a995;padding-left:20px;margin:30px 0;">
            <h2 style="color:#17675c;">What to notice</h2>
            <ul>
              <li>Small snails attached to the rock surface.</li>
              <li>Anemones closing when disturbed.</li>
              <li>Seaweed moving with the smallest current.</li>
              <li>Different colours and textures beneath the water.</li>
            </ul>
          </section>
          <nav style="background-color:#174f49;color:white;padding:24px;border-radius:14px;">
            <p style="font-size:12px;letter-spacing:2px;color:#a9d9c9;">CONTINUE EXPLORING</p>
            <p><a href="lighthouse.zz" data-address="lighthouse.zz" style="color:#c9f1df;">Discover the coastal lighthouse →</a></p>
            <p><a href="kelp.zz" data-address="kelp.zz" style="color:#c9f1df;">Explore a kelp forest →</a></p>
            <p><a href="ghost.zz" data-address="ghost.zz" style="color:#c9f1df;">The missing marine archive →</a></p>
          </nav>
        </main>
        <footer style="padding-top:24px;text-align:center;color:#64867d;font-size:12px;">
          THE LIVING TIDEPOOL · A COASTAL FIELD JOURNAL
        </footer>
      </div>
    `,
  },
  {
    address: 'lighthouse.zz',
    title: 'The Coastal Lighthouse',
    author: 'Aleeza',
    html: `
      <div class="site-lighthouse" style="background-color:#101e31;color:#eaf0f5;font-family:Georgia,serif;padding:30px;line-height:1.8;">
        <header style="background-color:#203953;padding:42px 30px;border-radius:4px;margin-bottom:30px;border-bottom:5px solid #d5a85e;">
          <p style="font-size:11px;letter-spacing:4px;color:#e5bd79;">MARITIME ARCHIVE · EST. 1892</p>
          <h1 style="font-size:42px;line-height:1.15;color:#fff;margin:12px 0;">The Coastal Lighthouse</h1>
          <p style="color:#c7d4df;font-size:17px;">A beacon, a landmark, and a quiet witness to the sea.</p>
        </header>
        <main>
          <section style="background-color:#192b41;padding:25px;margin-bottom:22px;">
            <h2 style="color:#e5bd79;font-size:25px;">A light through the darkness</h2>
            <p>For generations, the lighthouse has guided vessels past dangerous rocks and unfamiliar shores. Its steady beam offers sailors a reliable point of reference when the coastline disappears into darkness.</p>
            <p>Before modern navigation systems, lighthouse keepers maintained the lamps, watched the weather and recorded the movements of ships along the coast.</p>
          </section>
          <section style="display:flex;gap:14px;margin:24px 0;">
            <div style="background-color:#2b4056;padding:20px;flex:1;border-radius:8px;">
              <p style="font-size:12px;color:#e5bd79;letter-spacing:2px;">THE TOWER</p>
              <h3 style="color:#fff;">Built to last</h3>
              <p style="font-size:14px;">Strong stone walls and elevated lantern rooms protect the light from the elements.</p>
            </div>
            <div style="background-color:#2b4056;padding:20px;flex:1;border-radius:8px;">
              <p style="font-size:12px;color:#e5bd79;letter-spacing:2px;">THE LANTERN</p>
              <h3 style="color:#fff;">A guiding signal</h3>
              <p style="font-size:14px;">Its rotating beam helps distinguish one stretch of coastline from another.</p>
            </div>
          </section>
          <blockquote style="border-left:3px solid #d5a85e;padding:15px 22px;color:#e5bd79;font-size:20px;font-style:italic;margin:28px 0;">
            "A lighthouse does not chase the ships. It simply keeps its light."
          </blockquote>
          <section>
            <h2 style="color:#e5bd79;">Explore the coastline</h2>
            <p><a href="kelp.zz" data-address="kelp.zz" style="color:#f0cd91;">The hidden world of kelp forests →</a></p>
            <p><a href="tidepool.zz" data-address="tidepool.zz" style="color:#f0cd91;">Return to the tidepool journal →</a></p>
            <p><a href="stormwatch.zz" data-address="stormwatch.zz" style="color:#f0cd91;">Read the storm watch records →</a></p>
          </section>
        </main>
        <footer style="border-top:1px solid #43556a;margin-top:30px;padding-top:18px;color:#a8b8c8;font-size:12px;">
          THE COASTAL LIGHTHOUSE · MARITIME ARCHIVE
        </footer>
      </div>
    `,
  },
  {
    address: 'kelp.zz',
    title: 'Inside a Kelp Forest',
    author: 'Aleeza',
    html: `
      <div class="site-kelp" style="background-color:#edf2df;color:#253c2c;font-family:Arial,sans-serif;padding:30px;line-height:1.8;">
        <header style="background-color:#244b36;color:#f4f6e9;padding:42px 30px;border-radius:28px 4px 28px 4px;margin-bottom:30px;">
          <p style="font-size:12px;letter-spacing:4px;color:#b9d29b;">UNDERWATER ECOLOGY</p>
          <h1 style="font-size:42px;line-height:1.15;margin:12px 0;">Inside a Kelp Forest</h1>
          <p style="font-size:17px;color:#d8e6c4;">An underwater forest that moves with the rhythm of the ocean.</p>
        </header>
        <main>
          <section>
            <h2 style="color:#315d3d;">A forest beneath the waves</h2>
            <p>Kelp forests are underwater ecosystems formed by large brown algae. Their tall blades rise from the seabed and create shelter for fish, sea otters, crabs and many other marine organisms.</p>
            <p>Like forests on land, kelp habitats provide food, protection and an interconnected environment where different species depend on one another.</p>
          </section>
          <section style="margin:28px 0;">
            <h2 style="color:#315d3d;">Three layers of life</h2>
            <article style="background-color:#d8e6c4;padding:20px;border-radius:12px;margin:12px 0;">
              <p style="font-size:11px;letter-spacing:2px;color:#547444;">01 · THE CANOPY</p>
              <h3 style="font-size:22px;">Where sunlight reaches</h3>
              <p>The upper blades spread toward the surface, creating a shaded environment below.</p>
            </article>
            <article style="background-color:#c4d9ad;padding:20px;border-radius:12px;margin:12px 0;">
              <p style="font-size:11px;letter-spacing:2px;color:#547444;">02 · THE MIDDLE FOREST</p>
              <h3 style="font-size:22px;">A busy underwater neighbourhood</h3>
              <p>Fish and smaller organisms move between the long, flexible kelp blades.</p>
            </article>
            <article style="background-color:#b1c99b;padding:20px;border-radius:12px;margin:12px 0;">
              <p style="font-size:11px;letter-spacing:2px;color:#547444;">03 · THE SEAFLOOR</p>
              <h3 style="font-size:22px;">Rooted to the rocks</h3>
              <p>Holdfasts anchor kelp to rocky surfaces, while many bottom-dwelling animals find shelter nearby.</p>
            </article>
          </section>
          <section style="background-color:#244b36;color:#f4f6e9;padding:24px;border-radius:14px;">
            <h2 style="color:#d8e6a8;">Why kelp matters</h2>
            <p>Kelp forests support biodiversity, provide nursery habitats and absorb carbon as they grow. Protecting these ecosystems means protecting many connected forms of marine life.</p>
          </section>
          <nav style="margin-top:28px;">
            <h2 style="color:#315d3d;">Related reading</h2>
            <p><a href="tidepool.zz" data-address="tidepool.zz" style="color:#286b47;">Meet the creatures of a tidepool →</a></p>
            <p><a href="saltcellar.zz" data-address="saltcellar.zz" style="color:#286b47;">Visit the harbour salt cellar →</a></p>
          </nav>
        </main>
        <footer style="margin-top:28px;border-top:1px solid #b7c7a7;padding-top:18px;color:#60735c;font-size:12px;">
          UNDERWATER ECOLOGY · FIELD SERIES 03
        </footer>
      </div>
    `,
  },
  {
    address: 'saltcellar.zz',
    title: 'The Harbour Salt Cellar',
    author: 'Omar',
    html: `
      <div class="site-saltcellar" style="background-color:#f3e9d8;color:#493a2e;font-family:Georgia,serif;padding:30px;line-height:1.8;">
        <header style="background-color:#694b37;color:#fff5e6;padding:42px 30px;margin-bottom:30px;border-radius:5px;">
          <p style="font-size:11px;letter-spacing:4px;color:#e5c89e;">HARBOUR HERITAGE · LOCAL STORIES</p>
          <h1 style="font-size:40px;line-height:1.15;margin:12px 0;">The Harbour Salt Cellar</h1>
          <p style="color:#f0dfc5;font-size:17px;">A small building with a long history of trade, craft and coastal life.</p>
        </header>
        <main>
          <section>
            <h2 style="color:#875c39;">The value of salt</h2>
            <p>Long before refrigeration became common, salt was essential to preserving food. Fishing communities relied on it to keep their catch usable during long journeys and through changing seasons.</p>
            <p>The harbour salt cellar became a practical centre of activity. Workers stored supplies, prepared goods and helped connect local fishing families with merchants from distant ports.</p>
          </section>
          <section style="margin:30px 0;">
            <h2 style="color:#875c39;">A short history</h2>
            <div style="border-left:3px solid #b88b58;padding-left:20px;">
              <p><strong>Early harbour days</strong></p>
              <p>Salt arrives by boat and is stored close to the fishing docks.</p>
              <p><strong>A growing trade</strong></p>
              <p>Local merchants begin exchanging preserved seafood and other goods.</p>
              <p><strong>A heritage landmark</strong></p>
              <p>The old building becomes a reminder of the harbour's working history.</p>
            </div>
          </section>
          <section style="background-color:#e7d4b9;padding:24px;border-radius:10px;">
            <h2 style="color:#694b37;">From harbour to table</h2>
            <p>Salt connects the everyday work of fishermen, food makers and families. Its story is a reminder that even the simplest materials can shape an entire community.</p>
          </section>
          <nav style="margin-top:28px;">
            <h2 style="color:#875c39;">Explore nearby stories</h2>
            <p><a href="harbourbakery.zz" data-address="harbourbakery.zz" style="color:#8b5631;">The bakery by the harbour →</a></p>
            <p><a href="stormwatch.zz" data-address="stormwatch.zz" style="color:#8b5631;">Storm watch field notes →</a></p>
            <p><a href="tidetables.zz" data-address="tidetables.zz" style="color:#8b5631;">Understanding the tide tables →</a></p>
          </nav>
        </main>
        <footer style="margin-top:30px;border-top:1px solid #d5c1a5;padding-top:18px;color:#927d64;font-size:12px;">
          HARBOUR HERITAGE COLLECTION · STORY 04
        </footer>
      </div>
    `,
  },
  {
    address: 'harbourbakery.zz',
    title: 'A Bakery by the Harbour',
    author: 'Omar',
    html: `
      <div class="site-bakery" style="background-color:#fff4e7;color:#533b2d;font-family:Arial,sans-serif;padding:30px;line-height:1.8;">
        <header style="background-color:#8d4935;color:#fff8ec;padding:42px 30px;border-radius:20px 20px 4px 4px;margin-bottom:28px;">
          <p style="font-size:11px;letter-spacing:4px;color:#f4d0a9;">BAKERY NOTES · SINCE 1958</p>
          <h1 style="font-family:Georgia,serif;font-size:42px;line-height:1.15;margin:12px 0;">A Bakery by the Harbour</h1>
          <p style="font-size:17px;color:#ffe3c5;">Warm bread, familiar faces and mornings that begin before sunrise.</p>
        </header>
        <main>
          <section>
            <h2 style="font-family:Georgia,serif;color:#a05238;font-size:27px;">The smell of a new morning</h2>
            <p>At the edge of the harbour, a small bakery opens its doors while the streets are still quiet. Fishermen stop by after early shifts, shopkeepers collect their breakfast, and the first trays of bread arrive fresh from the oven.</p>
            <p>The bakery has become part of the neighbourhood's daily rhythm. Its recipes are simple, its ingredients familiar, and its regular customers know exactly which loaf they want.</p>
          </section>
          <section style="background-color:#f3dfc9;padding:23px;border-radius:14px;margin:25px 0;">
            <h2 style="color:#8d4935;font-family:Georgia,serif;">A morning at the bakery</h2>
            <p><strong>5:00 AM</strong> — Dough is prepared and left to rise.</p>
            <p><strong>6:00 AM</strong> — The first loaves enter the oven.</p>
            <p><strong>7:00 AM</strong> — The counter fills with fresh bread and pastries.</p>
            <p><strong>9:00 AM</strong> — Harbour workers gather for a short breakfast.</p>
          </section>
          <section>
            <h2 style="font-family:Georgia,serif;color:#a05238;">More than a shop</h2>
            <p>A neighbourhood bakery is also a meeting place. News travels across the counter, familiar customers exchange greetings, and small everyday routines become part of a shared community.</p>
          </section>
          <nav style="background-color:#8d4935;padding:23px;border-radius:12px;margin-top:28px;">
            <p style="font-size:11px;letter-spacing:2px;color:#f4d0a9;">FROM THE HARBOUR COLLECTION</p>
            <p><a href="saltcellar.zz" data-address="saltcellar.zz" style="color:#fff0d9;">The story of the harbour salt cellar →</a></p>
            <p><a href="tidetables.zz" data-address="tidetables.zz" style="color:#fff0d9;">Plan your morning with tide tables →</a></p>
          </nav>
        </main>
        <footer style="padding-top:22px;text-align:center;color:#a27d62;font-size:12px;">
          THE HARBOUR BAKERY · MADE FRESH EVERY MORNING
        </footer>
      </div>
    `,
  },
  {
    address: 'stormwatch.zz',
    title: 'Storm Watch Field Notes',
    author: 'Hina',
    html: `
      <div class="site-stormwatch" style="background-color:#e9eef4;color:#24364a;font-family:Arial,sans-serif;padding:30px;line-height:1.8;">
        <header style="background-color:#182d45;color:#edf5ff;padding:42px 30px;border-radius:4px 4px 22px 4px;margin-bottom:30px;">
          <p style="font-size:11px;letter-spacing:4px;color:#9fc5e5;">COASTAL OBSERVATORY · WEATHER LOG</p>
          <h1 style="font-size:42px;line-height:1.15;margin:12px 0;">Storm Watch</h1>
          <p style="color:#c6d9ea;font-size:17px;">Field notes on changing skies, rough seas and coastal weather.</p>
        </header>
        <main>
          <section>
            <h2 style="color:#28547a;">Reading the signs</h2>
            <p>Coastal storms can develop quickly. Changes in wind direction, falling air pressure and growing cloud formations may indicate that weather conditions are becoming unstable.</p>
            <p>Observers record these changes to understand how the atmosphere and ocean interact before, during and after a storm.</p>
          </section>
          <section style="background-color:#d5e2ef;padding:24px;border-radius:12px;margin:25px 0;">
            <p style="font-size:11px;letter-spacing:2px;color:#426889;">FIELD CHECKLIST</p>
            <h2 style="color:#244967;">What observers record</h2>
            <ul>
              <li>Wind direction and estimated strength.</li>
              <li>Cloud cover and visibility.</li>
              <li>Changes in air pressure.</li>
              <li>Wave height and coastal conditions.</li>
              <li>Time and direction of rainfall.</li>
            </ul>
          </section>
          <section>
            <h2 style="color:#28547a;">Why records matter</h2>
            <p>Consistent observations help researchers compare weather patterns and understand how coastal communities experience changing conditions. A single observation is useful, but a long series of reliable records tells a much bigger story.</p>
          </section>
          <blockquote style="background-color:#182d45;color:#d8e8f7;padding:24px;border-radius:10px;font-size:18px;font-style:italic;">
            The sea changes its mood, but careful observation helps us understand its language.
          </blockquote>
          <nav style="margin-top:28px;">
            <h2 style="color:#28547a;">Continue the observation</h2>
            <p><a href="tidetables.zz" data-address="tidetables.zz" style="color:#28618d;">Learn how to read tide tables →</a></p>
            <p><a href="lighthouse.zz" data-address="lighthouse.zz" style="color:#28618d;">Visit the coastal lighthouse →</a></p>
          </nav>
        </main>
        <footer style="border-top:1px solid #c2d1df;margin-top:30px;padding-top:18px;color:#71859a;font-size:12px;">
          COASTAL OBSERVATORY · WEATHER LOG 06
        </footer>
      </div>
    `,
  },
  {
    address: 'tidetables.zz',
    title: 'Understanding Tide Tables',
    author: 'Hina',
    html: `
      <div class="site-tidetables" style="background-color:#f0f7fa;color:#203e51;font-family:Arial,sans-serif;padding:30px;line-height:1.8;">
        <header style="background-color:#1d526c;color:#f0fbff;padding:42px 30px;border-radius:16px;margin-bottom:30px;">
          <p style="font-size:11px;letter-spacing:4px;color:#a8dbe9;">THE COASTAL GUIDE · LEARN SERIES</p>
          <h1 style="font-size:40px;line-height:1.15;margin:12px 0;">Understanding Tide Tables</h1>
          <p style="font-size:17px;color:#d1edf4;">A practical introduction to the daily rise and fall of the sea.</p>
        </header>
        <main>
          <section>
            <h2 style="color:#1d6680;">What is a tide?</h2>
            <p>Tides are the regular rise and fall of sea level, mainly caused by the gravitational pull of the Moon and the Sun. Along most coastlines, water moves through repeating high and low tide cycles.</p>
            <p>Knowing when these changes occur can help people plan coastal walks, fishing trips, boat journeys and shoreline observations.</p>
          </section>
          <section style="display:flex;gap:14px;margin:26px 0;">
            <article style="background-color:#cce8ef;padding:20px;border-radius:12px;flex:1;">
              <p style="font-size:11px;letter-spacing:2px;color:#31758a;">HIGH TIDE</p>
              <h2 style="font-size:23px;color:#1d526c;">Water rises</h2>
              <p style="font-size:14px;">The sea reaches a higher level and covers more of the shore.</p>
            </article>
            <article style="background-color:#dcebe9;padding:20px;border-radius:12px;flex:1;">
              <p style="font-size:11px;letter-spacing:2px;color:#31758a;">LOW TIDE</p>
              <h2 style="font-size:23px;color:#1d526c;">Water retreats</h2>
              <p style="font-size:14px;">More of the beach, rocks and tidepools become visible.</p>
            </article>
          </section>
          <section style="background-color:#fff;padding:24px;border:1px solid #d2e4e9;border-radius:12px;margin:25px 0;">
            <h2 style="color:#1d6680;">How to read a tide table</h2>
            <ol>
              <li>Find the date you plan to visit.</li>
              <li>Check the listed high and low tide times.</li>
              <li>Look at the predicted water heights.</li>
              <li>Remember that local weather can affect actual conditions.</li>
            </ol>
          </section>
          <section>
            <h2 style="color:#1d6680;">A useful reminder</h2>
            <p>Tide predictions are guides, not guarantees of safe conditions. Strong winds, waves and local geography can change what the shoreline looks like at a particular moment.</p>
          </section>
          <nav style="background-color:#1d526c;color:#fff;padding:23px;border-radius:12px;margin-top:28px;">
            <p style="font-size:11px;letter-spacing:2px;color:#a8dbe9;">RELATED COASTAL NOTES</p>
            <p><a href="stormwatch.zz" data-address="stormwatch.zz" style="color:#d5f4ff;">Read the storm watch records →</a></p>
            <p><a href="cartography.zz" data-address="cartography.zz" style="color:#d5f4ff;">Explore coastal maps →</a></p>
          </nav>
        </main>
        <footer style="padding-top:22px;text-align:center;color:#718c9a;font-size:12px;">
          THE COASTAL GUIDE · LEARN SERIES 07
        </footer>
      </div>
    `,
  },
  {
    address: 'fieldnotes.zz',
    title: 'Field Notes from the Shore',
    author: 'Sara',
    html: `
      <div class="site-fieldnotes" style="background-color:#f1f0e5;color:#354436;font-family:Georgia,serif;padding:30px;line-height:1.8;">
        <header style="background-color:#354e3a;color:#f6f3e7;padding:42px 30px;margin-bottom:30px;border-radius:3px;">
          <p style="font-size:11px;letter-spacing:4px;color:#c6d1a9;">NATURALIST'S NOTEBOOK · VOL. 08</p>
          <h1 style="font-size:40px;line-height:1.15;margin:12px 0;">Field Notes from the Shore</h1>
          <p style="font-size:17px;color:#dce4c8;">Small discoveries from a changing coastline.</p>
        </header>
        <main>
          <section>
            <h2 style="color:#4b6945;">The value of looking closely</h2>
            <p>Shoreline observation begins with patience. A short walk can reveal tracks in wet sand, shells carried by the tide, changing plant life and the movements of birds along the water's edge.</p>
            <p>Recording these details helps build a picture of the environment over time. What seems ordinary today may become an important clue when compared with observations made weeks or months later.</p>
          </section>
          <section style="margin:28px 0;">
            <h2 style="color:#4b6945;">A simple observation routine</h2>
            <article style="background-color:#e0e4cf;padding:20px;margin:12px 0;border-radius:10px;">
              <p style="font-size:11px;letter-spacing:2px;color:#65784e;">STEP 01</p>
              <h3 style="font-size:22px;">Notice</h3>
              <p>Look for changes in the shoreline, water, plants and animal activity.</p>
            </article>
            <article style="background-color:#d6dfc4;padding:20px;margin:12px 0;border-radius:10px;">
              <p style="font-size:11px;letter-spacing:2px;color:#65784e;">STEP 02</p>
              <h3 style="font-size:22px;">Record</h3>
              <p>Write down the date, location, weather and details that stand out.</p>
            </article>
            <article style="background-color:#cbd8b8;padding:20px;margin:12px 0;border-radius:10px;">
              <p style="font-size:11px;letter-spacing:2px;color:#65784e;">STEP 03</p>
              <h3 style="font-size:22px;">Compare</h3>
              <p>Return to the same place and compare your observations over time.</p>
            </article>
          </section>
          <blockquote style="border-left:4px solid #82966b;padding:14px 20px;color:#58714c;font-size:19px;font-style:italic;">
            The coastline is never quite the same twice. That is what makes it worth observing.
          </blockquote>
          <nav style="margin-top:28px;">
            <h2 style="color:#4b6945;">From the notebook</h2>
            <p><a href="cartography.zz" data-address="cartography.zz" style="color:#416b48;">How maps tell the story of a coast →</a></p>
            <p><a href="driftwood.zz" data-address="driftwood.zz" style="color:#416b48;">The driftwood collection →</a></p>
          </nav>
        </main>
        <footer style="border-top:1px solid #c9cdb6;margin-top:30px;padding-top:18px;color:#77816c;font-size:12px;">
          FIELD NOTES FROM THE SHORE · NATURALIST'S NOTEBOOK
        </footer>
      </div>
    `,
  },
  {
    address: 'cartography.zz',
    title: 'Coastal Cartography',
    author: 'Sara',
    html: `
      <div class="site-cartography" style="background-color:#e9edf0;color:#23384b;font-family:Arial,sans-serif;padding:30px;line-height:1.8;">
        <header style="background-color:#263f54;color:#f4f0df;padding:42px 30px;margin-bottom:30px;border-bottom:6px solid #b98c55;">
          <p style="font-size:11px;letter-spacing:4px;color:#d9bd91;">ATLAS & CARTOGRAPHY · MAP ROOM</p>
          <h1 style="font-size:42px;line-height:1.15;margin:12px 0;">Coastal Cartography</h1>
          <p style="font-size:17px;color:#d1dce1;">Understanding shorelines through the art and science of maps.</p>
        </header>
        <main>
          <section>
            <h2 style="color:#345d76;">Mapping a changing coastline</h2>
            <p>Coastal maps help people understand the shape of the land, the position of waterways and the location of important landmarks. They can support navigation, environmental research and the planning of coastal communities.</p>
            <p>Unlike a fixed road network, a shoreline can change through erosion, sediment movement, storms and rising sea levels. Maps must therefore be understood as records of a particular place at a particular time.</p>
          </section>
          <section style="background-color:#d6e0e3;padding:24px;border-radius:4px;margin:25px 0;">
            <p style="font-size:11px;letter-spacing:2px;color:#54778a;">THE MAPMAKER'S TOOLKIT</p>
            <h2 style="color:#263f54;">Four useful elements</h2>
            <p><strong>Scale</strong> — Shows the relationship between map distance and real distance.</p>
            <p><strong>Legend</strong> — Explains the symbols used on the map.</p>
            <p><strong>Orientation</strong> — Helps readers understand direction.</p>
            <p><strong>Coordinates</strong> — Help identify a location precisely.</p>
          </section>
          <section>
            <h2 style="color:#345d76;">Maps as historical records</h2>
            <p>Comparing maps from different years can reveal changes in beaches, harbours, wetlands and settlements. Old maps are valuable records, while modern surveys provide updated measurements and detail.</p>
          </section>
          <nav style="background-color:#263f54;padding:24px;margin-top:28px;">
            <p style="font-size:11px;letter-spacing:2px;color:#d9bd91;">EXPLORE THE COLLECTION</p>
            <p><a href="fieldnotes.zz" data-address="fieldnotes.zz" style="color:#f4d7a9;">Return to the shore field notes →</a></p>
            <p><a href="tidepool.zz" data-address="tidepool.zz" style="color:#f4d7a9;">Explore the living tidepool →</a></p>
          </nav>
        </main>
        <footer style="border-top:1px solid #bac7ce;margin-top:30px;padding-top:18px;color:#728391;font-size:12px;">
          COASTAL CARTOGRAPHY · ATLAS COLLECTION 09
        </footer>
      </div>
    `,
  },
  {
    address: 'driftwood.zz',
    title: 'The Driftwood Collection',
    author: 'Bilal',
    html: `
      <div class="site-driftwood" style="background-color:#f0e8dc;color:#493d32;font-family:Georgia,serif;padding:30px;line-height:1.8;">
        <header style="background-color:#574b3e;color:#f7f0e5;padding:42px 30px;border-radius:4px;margin-bottom:30px;">
          <p style="font-size:11px;letter-spacing:4px;color:#d9c5a5;">OBJECTS FROM THE SHORE · COLLECTION 10</p>
          <h1 style="font-size:42px;line-height:1.15;margin:12px 0;">The Driftwood Collection</h1>
          <p style="font-size:17px;color:#e8d9c3;">Every piece of driftwood carries a journey written by water, weather and time.</p>
        </header>
        <main>
          <section>
            <h2 style="color:#8a6746;">A natural collection</h2>
            <p>Driftwood begins as ordinary wood from trees, branches or other natural sources. Once carried into rivers or the sea, it may travel for long distances before washing onto a beach.</p>
            <p>Saltwater, sunlight and constant movement gradually change its surface. The result is a collection of unique shapes, textures and colours that reflect the conditions of its journey.</p>
          </section>
          <section style="margin:28px 0;">
            <h2 style="color:#8a6746;">Three things worth noticing</h2>
            <article style="background-color:#e3d4bf;padding:22px;margin:12px 0;border-radius:12px;">
              <p style="font-size:11px;letter-spacing:2px;color:#8a6746;">01 · TEXTURE</p>
              <h3 style="font-size:22px;">The surface tells a story</h3>
              <p>Weathering can leave wood smooth, rough, pale or deeply marked.</p>
            </article>
            <article style="background-color:#e9dbc8;padding:22px;margin:12px 0;border-radius:12px;">
              <p style="font-size:11px;letter-spacing:2px;color:#8a6746;">02 · SHAPE</p>
              <h3 style="font-size:22px;">No two journeys are alike</h3>
              <p>Currents and waves can bend, break and reshape pieces of wood.</p>
            </article>
            <article style="background-color:#dccbb5;padding:22px;margin:12px 0;border-radius:12px;">
              <p style="font-size:11px;letter-spacing:2px;color:#8a6746;">03 · ORIGIN</p>
              <h3 style="font-size:22px;">A journey from somewhere else</h3>
              <p>Each piece may have travelled through rivers, estuaries and coastal waters.</p>
            </article>
          </section>
          <blockquote style="border-left:4px solid #a98963;padding:15px 20px;color:#795d40;font-size:19px;font-style:italic;">
            The sea does not keep everything it carries. Sometimes it returns a story to the shore.
          </blockquote>
          <nav style="margin-top:28px;">
            <h2 style="color:#8a6746;">More coastal discoveries</h2>
            <p><a href="fieldnotes.zz" data-address="fieldnotes.zz" style="color:#8b5d37;">Read the field notes from the shore →</a></p>
            <p><a href="saltcellar.zz" data-address="saltcellar.zz" style="color:#8b5d37;">Discover the harbour salt cellar →</a></p>
            <p><a href="lostlight.zz" data-address="lostlight.zz" style="color:#8b5d37;">The lost coastal light archive →</a></p>
          </nav>
        </main>
        <footer style="border-top:1px solid #d2c2ae;margin-top:30px;padding-top:18px;color:#927d69;font-size:12px;">
          THE DRIFTWOOD COLLECTION · OBJECTS FROM THE SHORE
        </footer>
      </div>
    `,
  },
];

const visitTrail = [
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
  { person: 'Omar', address: 'saltcellar.zz', via: VisitSource.TYPED, found: true, minute: 42 },
  { person: 'Omar', address: 'harbourbakery.zz', via: VisitSource.LINK, found: true, minute: 45 },
  { person: 'Hina', address: 'stormwatch.zz', via: VisitSource.TYPED, found: true, minute: 48 },
  { person: 'Hina', address: 'tidetables.zz', via: VisitSource.LINK, found: true, minute: 51 },
  { person: 'Bilal', address: 'driftwood.zz', via: VisitSource.TYPED, found: true, minute: 54 },
  { person: 'Bilal', address: 'fieldnotes.zz', via: VisitSource.LINK, found: true, minute: 57 },
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

  for (const page of seedPages) {
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

  // Replace only seeded visits; preserve real user-created visits.
  await VisitModel.deleteMany({ seeded: true });

  const startTime = new Date('2026-11-03T09:00:00.000Z');

  if (visitTrail.length > 0) {
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
  }

  console.log(
    `Seed complete: ${people.length} people, ${seedPages.length} websites, ${visitTrail.length} seeded visits.`,
  );
}

seed()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });