# NALIMA Technical Report

## Problem

Nalima supports agricultural reasoning when a farmer or extension worker cannot rely on a live cloud connection. The target is practical decision support: crop planning, crop-health observation, water management, livestock record-taking, and agricultural education.

## Design decisions

The initial candidate is Qwen2.5 1.5B Instruct in Q4_K_M GGUF form. It is small enough to be evaluated on the ADTC budget profile while retaining instruction-following capacity; final quality and performance must be measured rather than assumed. `llama.cpp` is the only inference runtime in the submission path.

Local retrieval uses a small, inspectable keyword-ranked knowledge set rather than a heavyweight vector database. Each item carries topic, region, language, content, provenance, and confidence fields. Retrieved context is inserted into the local prompt so agriculture changes the behavior of the system rather than only its visual identity.

## Constraints

The design targets an approximately 8 GB laptop profile with CPU/integrated graphics, limited memory, and intermittent connectivity. The model is not committed to Git. Runtime configuration is local, services bind through the development workflow, and no API key is needed.

## Benchmarks

Development machine measurements: NOT YET MEASURED.

Official ADTC measurements: NOT YET MEASURED. Run the official profiler on the target laptop; do not substitute these values with estimates.

## Challenges

The main trade-off is balancing answer quality against peak memory, speed, and thermal stability. Agricultural advice also has real-world risk: the system must expose uncertainty, avoid fabricated chemical or veterinary dosages, and point serious cases toward qualified local help.

## Future work

Future versions can add properly evaluated African-language support, larger locally sourced agricultural datasets, optional voice interfaces, image-assisted crop analysis, offline weather packages, farm records, and extension workflows. None of these capabilities are claimed in this submission.
