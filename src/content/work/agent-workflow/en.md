---
title: Agent Workflow
summary: task → agent chain → review → output
tags:
  - agents
  - workflow
---

ALTACO is testing an AI agent that helps staff and partners with questions about Bagnara and Santa Margherita products. It uses a vector database of verified supplier materials. The goal is to find stone specifications faster, explain them clearly and distinguish confirmed facts from questions requiring further checks.

Example consultation: Azul Aran® for a kitchen

The dialogue below is a demonstration prepared from Bagnara’s public pages. It illustrates the agent’s intended behaviour; it is not a transcript of an actual test.

Sales manager: A client wants natural stone in blue-grey tones for a kitchen worktop. Should we show them Azul Aran®?

Agent: Yes, it is worth considering. Bagnara describes Azul Aran® as granite from Spain with a blue-grey pattern. Its material page explicitly identifies it as suitable for kitchen worktops and notes its acid resistance. Source: Bagnara, Material catalog — AZUL ARAN®.

Sales manager: The client does not want a glossy surface. Is there another option?

Agent: Kitchen Selection lists two finishes for Azul Aran®: Satin and Polished. A Satin sample can be offered for comparison with the polished surface. A finish appearing in the catalogue does not establish that a matching slab is currently in ALTACO’s stock.

Sales manager: The worktop needs to be 2800 × 900 mm in 20 mm stone. Can we confirm the order?

Agent: Not yet. The pages reviewed do not confirm the dimensions or thickness of a specific available lot. The actual slab dimensions, finish, availability and delivery date need checking. A fabricator must also confirm feasibility against the drawing.

Sales manager: What is its exact water absorption?

Agent: The public Azul Aran® page does not provide a numerical value; Bagnara asks visitors to request access to technical information. Without the technical data sheet, I will not supply a figure or substitute one from another granite.

Sales manager: Draft a short reply to the client.

Agent: “We suggest considering Azul Aran® from Bagnara. We can show Satin and Polished samples for comparison. Before confirming an order, we will separately check availability in the required dimensions and thickness, fabrication feasibility and delivery timing.”

Consultation workflow

The intended workflow under testing is: question → clarification → database retrieval → source checks → answer or a list of questions for the manager.

1. Clarify the task. Identify the material, application and required parameters. Ask a follow-up question if the name is ambiguous or the intended use is insufficiently specified.

2. Retrieve from the vector database. Select relevant passages from product cards, catalogues and technical documents based on the question’s meaning. A document about another material must not support an answer merely because its name is similar.

3. Check the evidence. Each conclusion requires a relevant source. General material descriptions, technical measurements and information about a particular lot are treated separately.

4. Answer with a source. Explain confirmed information in plain language. If evidence is insufficient, identify exactly what is missing. Catalogue information does not substitute for current stock, pricing or delivery dates.

5. Manager follow-up. Turn unresolved questions into a specific checklist for ALTACO, the supplier or the fabricator. The agent must not claim that a request has been forwarded or an order confirmed unless that action has actually occurred.

Testing should assess whether answers match their sources, whether refusals are appropriate and whether the consultation helps a manager complete a real task. This example alone does not establish the agent’s accuracy across all questions.

Example sources, checked on 5 September 2026: Bagnara — AZUL ARAN® (https://www.bagnara.net/en/our-stones/material-catalog/azul-aran/); Bagnara — Kitchen Selection (https://www.bagnara.net/en/kitchen-selection/).
