---
title: "Consulting across two catalogs — verified-source answer or refusal"
summary: task → agent chain → review → output
tags:
  - agents
  - workflow
---

ALTACO deployed an AI agent to advise staff and partners on Bagnara and
Santa Margherita products. The agent answers from a vector database of
verified data and is currently in testing. Below are five fixed
query-response examples: they show the boundary of its behavior, not
its interface — the agent answers only from a verified source, and
says plainly when no source exists instead of generating a plausible
answer.

Query: "What thickness and finish are available for [FILL IN: Bagnara
material name]?" — Agent's answer: "[FILL IN: format, thickness, finish
type], source — [FILL IN: name of the material card or spec in the
verified database]."

Query: "What's the difference between [FILL IN: Bagnara material name]
and [FILL IN: Santa Margherita material name] — they both look like
stone?" — Agent's answer: "[FILL IN: first material — natural stone or
agglomerate, characteristic], while [FILL IN: second material —
opposite type, characteristic]; the difference in material nature
affects [FILL IN: practical consequence — care, durability, or use
case]."

Query: "Is [FILL IN: material name] suitable for [FILL IN: application
scenario]?" — Agent's answer: "[FILL IN: yes, no, or conditionally —
with reasoning based on the material's characteristics from the
verified database]."

Query: "Does the database have exact technical specs for a sample from
the archive collection, discontinued a few years ago?" — Agent's
answer: "There's no confirmed information about this sample in the
verified database — I can't give an answer and won't generate one as a
guess. Passing this to a manager who can confirm the details directly."

Query: "What surface finish options are available for [FILL IN:
material name], and is it in stock?" — Agent's answer: "Confirmed from
the database: [FILL IN: list of available finishes]. Current stock
data in the database isn't up to date — that I can't confirm."
