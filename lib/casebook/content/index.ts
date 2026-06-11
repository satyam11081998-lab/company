import type { Page, NavNode } from '../types';
import { CASEBOOK_TREE } from '../tree';
import { profitability } from './frameworks/profitability';
import { marketEntry } from './frameworks/market-entry';
import { growth } from './frameworks/growth';
import { mergersAcquisitions } from './frameworks/m-and-a';
import { structuringFundamentals } from './frameworks/structuring-fundamentals';
import { pricing } from './frameworks/pricing';
import portersFiveForces from './toolkit/porters-five-forces';
import swot from './toolkit/swot';
import pestel from './toolkit/pestel';
import fourPs from './toolkit/4-ps';
import fiveCs from './toolkit/5-cs';
import customerJourney from './toolkit/customer-journey';
import bcgMatrix from './toolkit/bcg-matrix';
import valueChain from './toolkit/value-chain';
import ansoffMatrix from './toolkit/ansoff-matrix';
import mckinsey7s from './toolkit/mckinsey-7s';
import { valueAndSynergies } from './frameworks/m-and-a/value-and-synergies';
import { dueDiligence } from './frameworks/m-and-a/due-diligence';
import { privateEquity } from './frameworks/m-and-a/private-equity';
import { regionalDairyCooperative } from './cases/profitability/regional-dairy-cooperative';
import { evChargingPointsMetro } from './guesstimates/ev-charging-points-metro';
import { painAndPromise } from './guesstimates/pain-and-promise';
import { newBlocksTest } from './_test/new-blocks-test';
import { repeatableMethod } from './concepts/repeatable-method';
import { whatItTests } from './concepts/what-it-tests';
import { sixCaseTypes } from './concepts/six-case-types';
import { navigatingBlendedCases } from './concepts/navigating-blended-cases';
import { mathUnderPressure } from './concepts/math-under-pressure';
import { communicationUnderPressure } from './concepts/communication-under-pressure';
import { diagnosticAndPlan } from './concepts/diagnostic-and-plan';
import { stp } from './miscellaneous/misc-stp';
import { foura } from './miscellaneous/misc-4-as';
import { fivesenses } from './miscellaneous/misc-five-senses';
import { vrio } from './miscellaneous/misc-vrio';
import { moats } from './miscellaneous/misc-sustainable-advantage';
import { amo } from './miscellaneous/misc-amo';
import { fourm } from './miscellaneous/misc-4-ms';
import { fourv } from './miscellaneous/misc-4-vs-data';
import { tamsamsom } from './miscellaneous/misc-tam-sam-som';
// Cases — Profitability
import { multiplexMarginSqueeze } from './cases/profitability/multiplex-margin-squeeze';
import { cloudKitchenBurn } from './cases/profitability/cloud-kitchen-burn';
import { agriPumpWarranty } from './cases/profitability/agri-pump-warranty';
import { budgetHotelRevpar } from './cases/profitability/budget-hotel-revpar';
import { diagnosticLabExpansion } from './cases/profitability/diagnostic-lab-expansion';
// Cases — Market Entry
import { japaneseStationeryIndia } from './cases/market-entry/japanese-stationery-india';
import { evTwoWheelerTier2 } from './cases/market-entry/ev-two-wheeler-tier2';
import { d2cSkincareOffline } from './cases/market-entry/d2c-skincare-offline';
import { saasPayrollSea } from './cases/market-entry/saas-payroll-sea';
// Cases — Growth
import { regionalSnackBrand } from './cases/growth/regional-snack-brand';
import { vernacularEdtechPlateau } from './cases/growth/vernacular-edtech-plateau';
import { tier2GymChain } from './cases/growth/tier2-gym-chain';
// Cases — Pricing
import { airportLoungeAccess } from './cases/pricing/airport-lounge-access';
import { b2bIotSensor } from './cases/pricing/b2b-iot-sensor';
import { intercityBusDynamic } from './cases/pricing/intercity-bus-dynamic';
// Cases — M&A / PE / DD
import { coldChainAcquisition } from './cases/ma-pe-dd/cold-chain-acquisition';
import { peEyecareChain } from './cases/ma-pe-dd/pe-eyecare-chain';
import { cementSouthernTarget } from './cases/ma-pe-dd/cement-southern-target';
// Cases — Unconventional
import { railwayPlatformCrowding } from './cases/unconventional/railway-platform-crowding';
import { bloodDonationSupply } from './cases/unconventional/blood-donation-supply';
import { stadiumNonMatchday } from './cases/unconventional/stadium-non-matchday';
// Cases — Signature
import { airlineRegionalRoutes } from './cases/signature/airline-regional-routes';
import { festivalFlashSale } from './cases/signature/festival-flash-sale';
import { qsrPeRollout } from './cases/signature/qsr-pe-rollout';
import { solarEpcBid } from './cases/signature/solar-epc-bid';
// Guesstimates — Population & Consumption
import { smartphonesSoldIndia } from './guesstimates/smartphones-sold-india';
import { biryaniPlatesMetro } from './guesstimates/biryani-plates-metro';
import { schoolUniformsIndia } from './guesstimates/school-uniforms-india';
import { weddingsIndiaAnnual } from './guesstimates/weddings-india-annual';
import { toothpasteTubesIndia } from './guesstimates/toothpaste-tubes-india';
// Guesstimates — Infrastructure & Assets
import { petrolPumpsIndia } from './guesstimates/petrol-pumps-india';
import { hospitalBedsMetro } from './guesstimates/hospital-beds-metro';
import { atmsTier1City } from './guesstimates/atms-tier1-city';
import { deliveryRidersMetro } from './guesstimates/delivery-riders-metro';
import { mobileTowersIndia } from './guesstimates/mobile-towers-india';
// Guesstimates — Business & Revenue
import { multiplexScreenRevenue } from './guesstimates/multiplex-screen-revenue';
import { metroDailyRevenue } from './guesstimates/metro-daily-revenue';
import { iplFranchiseRevenue } from './guesstimates/ipl-franchise-revenue';
import { tollPlazaCollection } from './guesstimates/toll-plaza-collection';
import { kiranaMonthlyGmv } from './guesstimates/kirana-monthly-gmv';
// Guesstimates — Habits & Time
import { upiTransactionsDaily } from './guesstimates/upi-transactions-daily';
import { chaiRailwayStation } from './guesstimates/chai-railway-station';
import { officeElevatorTrips } from './guesstimates/office-elevator-trips';
import { ottWatchHours } from './guesstimates/ott-watch-hours';
import { cabRidesMetro } from './guesstimates/cab-rides-metro';
// Guesstimates — Curveballs
import { cityGarbageDaily } from './guesstimates/city-garbage-daily';
import { cricketBatsIndia } from './guesstimates/cricket-bats-india';
import { paintConsumptionIndia } from './guesstimates/paint-consumption-india';
import { waterTankersSummer } from './guesstimates/water-tankers-summer';
import { streetlightsMetro } from './guesstimates/streetlights-metro';
// Case Competitions track
import { whyTheyMatter } from './case-competitions/why-they-matter';
import { indiaCircuit } from './case-competitions/india-circuit';
import { teamFormation } from './case-competitions/team-formation';
import { decodingTheProblem } from './case-competitions/decoding-the-problem';
import { researchAndInsight } from './case-competitions/research-and-insight';
import { buildingTheSolution } from './case-competitions/building-the-solution';
import { theWinningDeck } from './case-competitions/the-winning-deck';
import { theFinalePitch } from './case-competitions/the-finale-pitch';
import { judgesAndMistakes } from './case-competitions/judges-and-mistakes';
import { zeroToPodiumRoadmap } from './case-competitions/zero-to-podium-roadmap';
const SEED_PAGES: Record<string, Page> = {
  [repeatableMethod.slug]: repeatableMethod,
  [newBlocksTest.slug]: newBlocksTest,
  [profitability.slug]: profitability,
  [marketEntry.slug]: marketEntry,
  [growth.slug]: growth,
  [mergersAcquisitions.slug]: mergersAcquisitions,
  [structuringFundamentals.slug]: structuringFundamentals,
  [pricing.slug]: pricing,
  [portersFiveForces.slug]: portersFiveForces,
  [swot.slug]: swot,
  [pestel.slug]: pestel,
  [fourPs.slug]: fourPs,
  [fiveCs.slug]: fiveCs,
  [customerJourney.slug]: customerJourney,
  [bcgMatrix.slug]: bcgMatrix,
  [valueChain.slug]: valueChain,
  [ansoffMatrix.slug]: ansoffMatrix,
  [mckinsey7s.slug]: mckinsey7s,
  [valueAndSynergies.slug]: valueAndSynergies,
  [dueDiligence.slug]: dueDiligence,
  [privateEquity.slug]: privateEquity,
  [regionalDairyCooperative.slug]: regionalDairyCooperative,
  [evChargingPointsMetro.slug]: evChargingPointsMetro,
  [painAndPromise.slug]: painAndPromise,
  [whatItTests.slug]: whatItTests,
  [sixCaseTypes.slug]: sixCaseTypes,
  [navigatingBlendedCases.slug]: navigatingBlendedCases,
  [mathUnderPressure.slug]: mathUnderPressure,
  [communicationUnderPressure.slug]: communicationUnderPressure,
  [diagnosticAndPlan.slug]: diagnosticAndPlan,
  [stp.slug]: stp,
  [foura.slug]: foura,
  [fivesenses.slug]: fivesenses,
  [vrio.slug]: vrio,
  [moats.slug]: moats,
  [amo.slug]: amo,
  [fourm.slug]: fourm,
  [fourv.slug]: fourv,
  [tamsamsom.slug]: tamsamsom,
  // Cases
  [multiplexMarginSqueeze.slug]: multiplexMarginSqueeze,
  [cloudKitchenBurn.slug]: cloudKitchenBurn,
  [agriPumpWarranty.slug]: agriPumpWarranty,
  [budgetHotelRevpar.slug]: budgetHotelRevpar,
  [diagnosticLabExpansion.slug]: diagnosticLabExpansion,
  [japaneseStationeryIndia.slug]: japaneseStationeryIndia,
  [evTwoWheelerTier2.slug]: evTwoWheelerTier2,
  [d2cSkincareOffline.slug]: d2cSkincareOffline,
  [saasPayrollSea.slug]: saasPayrollSea,
  [regionalSnackBrand.slug]: regionalSnackBrand,
  [vernacularEdtechPlateau.slug]: vernacularEdtechPlateau,
  [tier2GymChain.slug]: tier2GymChain,
  [airportLoungeAccess.slug]: airportLoungeAccess,
  [b2bIotSensor.slug]: b2bIotSensor,
  [intercityBusDynamic.slug]: intercityBusDynamic,
  [coldChainAcquisition.slug]: coldChainAcquisition,
  [peEyecareChain.slug]: peEyecareChain,
  [cementSouthernTarget.slug]: cementSouthernTarget,
  [railwayPlatformCrowding.slug]: railwayPlatformCrowding,
  [bloodDonationSupply.slug]: bloodDonationSupply,
  [stadiumNonMatchday.slug]: stadiumNonMatchday,
  [airlineRegionalRoutes.slug]: airlineRegionalRoutes,
  [festivalFlashSale.slug]: festivalFlashSale,
  [qsrPeRollout.slug]: qsrPeRollout,
  [solarEpcBid.slug]: solarEpcBid,
  // Guesstimates
  [smartphonesSoldIndia.slug]: smartphonesSoldIndia,
  [biryaniPlatesMetro.slug]: biryaniPlatesMetro,
  [schoolUniformsIndia.slug]: schoolUniformsIndia,
  [weddingsIndiaAnnual.slug]: weddingsIndiaAnnual,
  [toothpasteTubesIndia.slug]: toothpasteTubesIndia,
  [petrolPumpsIndia.slug]: petrolPumpsIndia,
  [hospitalBedsMetro.slug]: hospitalBedsMetro,
  [atmsTier1City.slug]: atmsTier1City,
  [deliveryRidersMetro.slug]: deliveryRidersMetro,
  [mobileTowersIndia.slug]: mobileTowersIndia,
  [multiplexScreenRevenue.slug]: multiplexScreenRevenue,
  [metroDailyRevenue.slug]: metroDailyRevenue,
  [iplFranchiseRevenue.slug]: iplFranchiseRevenue,
  [tollPlazaCollection.slug]: tollPlazaCollection,
  [kiranaMonthlyGmv.slug]: kiranaMonthlyGmv,
  [upiTransactionsDaily.slug]: upiTransactionsDaily,
  [chaiRailwayStation.slug]: chaiRailwayStation,
  [officeElevatorTrips.slug]: officeElevatorTrips,
  [ottWatchHours.slug]: ottWatchHours,
  [cabRidesMetro.slug]: cabRidesMetro,
  [cityGarbageDaily.slug]: cityGarbageDaily,
  [cricketBatsIndia.slug]: cricketBatsIndia,
  [paintConsumptionIndia.slug]: paintConsumptionIndia,
  [waterTankersSummer.slug]: waterTankersSummer,
  [streetlightsMetro.slug]: streetlightsMetro,
  // Case Competitions track
  [whyTheyMatter.slug]: whyTheyMatter,
  [indiaCircuit.slug]: indiaCircuit,
  [teamFormation.slug]: teamFormation,
  [decodingTheProblem.slug]: decodingTheProblem,
  [researchAndInsight.slug]: researchAndInsight,
  [buildingTheSolution.slug]: buildingTheSolution,
  [theWinningDeck.slug]: theWinningDeck,
  [theFinalePitch.slug]: theFinalePitch,
  [judgesAndMistakes.slug]: judgesAndMistakes,
  [zeroToPodiumRoadmap.slug]: zeroToPodiumRoadmap,
};

// Flatten tree to easily lookup nodes by slug
const flattenTree = (nodes: NavNode[]): NavNode[] => {
  return nodes.reduce((acc: NavNode[], node: NavNode) => {
    if (node.kind === 'page') {
      acc.push(node);
    }
    if (node.children) {
      acc.push(...flattenTree(node.children));
    }
    return acc;
  }, []);
};

const ALL_NODES = flattenTree(CASEBOOK_TREE);

export const ALL_PAGE_SLUGS: string[] = ALL_NODES.map(node => node.slug as string);

function inferKindFromSlug(slug: string): Page['kind'] {
  if (slug.startsWith('core-frameworks')) return 'framework';
  if (slug.startsWith('toolkit')) return 'toolkit';
  if (slug.startsWith('cases')) return 'case';
  if (slug.startsWith('guesstimates')) return 'guesstimate';
  if (slug.startsWith('industry-primers')) return 'primer';
  return 'concept';
}

export function getPage(slug: string): Page | null {
  // 1. Try to find a real authored page
  if (SEED_PAGES[slug]) {
    return SEED_PAGES[slug];
  }

  // 2. See if the slug exists in our tree map
  const treeNode = ALL_NODES.find(n => n.slug === slug);
  
  if (!treeNode) {
    return null; // Invalid slug, not in tree
  }

  // 3. Return a polished placeholder page
  return {
    slug,
    title: treeNode.title,
    subtitle: 'Chapter in progress',
    kind: inferKindFromSlug(slug),
    meta: treeNode.meta,
    blocks: [
      {
        type: 'callout',
        variant: 'note',
        title: 'Chapter in progress',
        md: 'This chapter is being authored and will appear here shortly.'
      }
    ]
  };
}
