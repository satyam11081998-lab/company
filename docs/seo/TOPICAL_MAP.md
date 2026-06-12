# Topical Map & Content Silo Strategy

**Date:** June 12, 2026
**Subject:** MECE Topical Authority Architecture
**Auditor:** Head of Organic Growth

## Executive Summary
This document outlines the topical mapping and content siloing strategy implemented across the MECE platform. By structuring content into distinct, heavily interlinked thematic clusters, MECE establishes domain authority in the "MBA Placement Preparation" niche.

## Topical Architecture (Part 9)

The platform is organized into distinct content silos, preventing theme dilution and ensuring clear semantic boundaries for crawlers.

### Silo 1: The Casebook (Core Methodology)
- **Primary Entity:** Case Interview Preparation
- **Clusters:**
  1. Getting Started (Methodology & Mindset)
  2. Core Frameworks (Profitability, Market Entry, etc.)
  3. Guesstimates (Market Sizing)
  4. Toolkit (Math, Communication)
  5. Worked Cases (Practical Application)
- **Silo Integrity:** Enforced by the `CASEBOOK_TREE` structure and the contextual internal linking engine.

### Silo 2: The Glossary (Foundational Knowledge)
- **Primary Entity:** Business & MBA Terminology
- **Clusters:**
  1. Consulting Terms
  2. Finance Terms
  3. Marketing Terms
  4. Operations Terms
  5. Product Terms
  6. Strategy Terms
- **Silo Integrity:** Enforced by programmatic generation (`/glossary/[term]`) and categorized index pages.

### Silo 3: Industry Primers (Domain Context)
- **Primary Entity:** Industry Knowledge for Consulting
- **Content:** Deep dives into specific sectors (e.g., FMCG, Banking, Telecom).
- **Silo Integrity:** Standalone artifacts embedded within the casebook experience, providing high-value EEAT signals.

## Semantic Relationships (The "Mesh")
While silos organize content vertically, the internal linking engine and Glossary `relatedCasebookPages` properties create a horizontal "mesh." 

*Example Path:*
User searches "What is EBITDA" -> Lands on Glossary: EBITDA -> Reads definition -> Clicks related term "Profitability Framework" -> Lands on Glossary: Profitability Framework -> Clicks "Practice with MECE" -> Lands on Casebook: Profitability Framework Guide -> Clicks "Up Next" -> Lands on Worked Case: Declining Airline Profits.

## SEO Impact
This architecture prevents "keyword cannibalization." Rather than having 10 pages vaguely discussing profitability, the topical map designates a single canonical definition (Glossary), a single canonical methodology guide (Casebook Framework), and specific application instances (Worked Cases).

## Conclusion
The topical map is comprehensive and structurally sound. It provides a logical progression for users while signaling profound depth of expertise to search engines, fulfilling the requirements for topical authority.
