"""
Management command: update_college_event_rules
Sets the official MacFiesta 2026 college event rules, manpower, possible problems & solutions, and committee approach for all 13 events.
Run: python manage.py update_college_event_rules
"""

from django.core.management.base import BaseCommand
from events.models import Event

RULES = {
    "vibe-coding-hackathon": """Avengers: Code Assemble — Vibe Coding Hackathon
"Assemble Your Ideas. Code Your Victory."

Rules & Regulations
1. Team participation only; each team must have 1 or 3 members. A participant may belong to only one team.
2. Teams must report at least 30 minutes before the start for verification, briefing, and workstation allocation.
3. The problem statement/domain and final submission deadline will be announced by the organizers. The build period is 6 hours unless officially revised.
4. All development must take place during the competition. Pre-built complete projects are prohibited; commonly available libraries, frameworks, APIs, and starter templates may be used if declared.
5. Teams must use their own laptops, chargers, extension requirements, and any approved development hardware. Internet use is permitted only for documentation, packages, APIs, and research relevant to the build.
6. The submission must include working source code, a short README, a presentation or pitch, and a functional demo or clearly documented prototype.
7. Plagiarism, copied repositories presented as original work, unauthorized collaboration, or use of another team's code will result in disqualification.
8. AI coding assistants may be used unless restricted during the briefing, but teams remain responsible for understanding, explaining, and validating every submitted component.
9. Each team will receive a fixed presentation and question time. All members should be available during evaluation.
10. Judging will consider problem relevance, innovation, technical implementation, usability, completeness, impact, and presentation. Judges' decision is final and binding.

Manpower
• 1 Event Head
• 2 Technical Coordinators
• 2–3 Mentors/Floor Volunteers
• 2–3 Judges
• 1 Timekeeper and Submission Coordinator

Possible Problems & Solutions
• Internet or power failure: Keep offline copies of problem statements and submission forms, arrange extension boards and backup power where possible, and record any official compensatory time equally for affected teams.
• Copied or pre-built projects: Collect repository links at the start and end, check commit history, question teams about implementation, and run plagiarism checks where practical.
• Submission failure: Provide one official upload route plus a local USB/offline backup. Record the submission time and freeze the submitted version.
• Unequal judging: Use a common scoring sheet and at least two judges. Resolve large scoring differences through a brief judges' review.
• System failure: Ask teams to maintain local backups. Organizers are not responsible for personal-device failure, but may allow a short verified recovery period if the schedule permits.

Committee Approach
Begin with registration verification, rule briefing, and problem announcement. Record team details and repository links, conduct milestone checks without giving solutions, announce time warnings, freeze submissions at the deadline, and evaluate every team using the same rubric. Suggested scoring: Innovation 20 | Technical Implementation 25 | Problem Relevance 15 | Functionality 15 | User Experience 10 | Impact/Scalability 5 | Presentation/Q&A 10.""",

    "coding-challenge": """The Flash: Code Rush — Coding Challenge
"Think Fast. Code Faster."

Rules & Regulations
1. Individual participation only. Participants must use the registration name and assigned system or seat.
2. The challenge will contain programming problems of varying difficulty and must be completed within the announced duration (suggested: 2 hours).
3. Only the programming languages and online/offline judge platform announced by the organizers may be used.
4. Communication, code sharing, and use of another person's solution are prohibited.
5. Use of generative AI, messaging applications, external solution websites, personal code libraries, or unauthorized devices is prohibited unless explicitly allowed.
6. Solutions must read input and produce output exactly as specified. Hard-coded outputs or attempts to interfere with the judge platform lead to disqualification.
7. Ranking will be based on problems solved, test cases passed, and penalty time or submission attempts as configured by the platform.
8. Any technical issue must be reported immediately; time adjustments will be granted only by the Event Head and applied fairly.
9. In a tie, the participant with more fully solved problems, then lower penalty time, then earlier final accepted submission will rank higher.
10. The organizers' and judges' decision is final and binding.

Manpower
• 1 Event Head
• 2 Technical Coordinators
• 2 Lab Volunteers/Invigilators
• 1 Judge or Problem-Setting Team

Possible Problems & Solutions
• Platform or network failure: Keep an offline problem set and local submission backup; pause or extend the contest only through an official announcement.
• Cheating or code sharing: Seat participants adequately apart, monitor screens, restrict unauthorized sites, and compare suspiciously similar code.
• Incorrect test cases: Test every problem in advance and keep one technical judge available to validate genuine disputes.
• Language/compiler issue: Publish supported versions before the event and test each compiler on the contest machines.

Committee Approach
Run a 10-minute briefing and sample submission before starting the timer. Display remaining time, maintain an incident log, lock submissions at the end, and export the final scoreboard. Do not reveal hidden test cases during the competition.""",

    "bgmi": """Infinity War — BGMI Tournament
"One Battleground. One Survivor."

Rules & Regulations
1. Squad participation only; each squad must have exactly 4 players. Substitutes are not permitted.
2. All players must use their registered in-game name and player ID. Account changes after verification require organizer approval.
3. Matches will be played in the BGMI custom room using the announced map, mode, perspective, server, and scoring system.
4. Players must use their own mobile devices, earphones, chargers, and permitted network connection. Tablets, emulators, triggers, controllers, config files, GFX tools, scripts, hacks, or unauthorized third-party software are prohibited.
5. Teaming with opponents, stream-sniping, ghosting, exploiting bugs, abusive communication, and sharing room credentials are prohibited.
6. Players must join the room before the announced deadline. The match will not be restarted for an individual device, battery, call, or network problem after the official start.
7. A restart may occur only for a verified server/custom-room failure affecting several teams and only before the defined restart threshold.
8. Points will be awarded for placement and finishes according to the published table. Penalties or disqualification may be imposed for rule violations.
9. Tie-break order: total wins/Chicken Dinners → total finish points → best placement in the latest match → total damage if verified statistics are available.

Manpower
• 1 Event Head/Tournament Admin
• 2 Room and Score Coordinators
• 2 Floor Volunteers
• 1 Technical/Network Support Volunteer
• 1 Observer or Fair-Play Official

Possible Problems & Solutions
• Network or server issue: Test the custom room and connectivity, announce restart conditions beforehand, and never restart only because one player disconnects.
• Wrong player or account: Verify player IDs before the first match and maintain a registered roster.
• Cheating allegation: Collect evidence, review observer footage or match statistics, and avoid deciding from verbal claims alone.
• Score dispute: Publish the scoring table before play and display a provisional scoreboard with a short dispute window.

Committee Approach
Conduct device and roster verification, explain room secrecy and scoring, run matches on a fixed schedule, capture end-screen statistics, calculate scores in a locked master sheet, and publish provisional results before final confirmation.""",

    "efootball": """Justice League: Ultimate XI — EFootball Tournament
"Assemble Your XI. Rule the Pitch."

Rules & Regulations
1. Individual participation only. The format may be knockout or group-plus-knockout depending on registrations and must be announced before the draw.
2. Matches will use the organizer-approved console/mobile platform, game version, controls, difficulty, team settings, and match duration.
3. Suggested settings: standard teams, normal condition/arrows, extra time and penalties enabled for knockout matches, and no custom-modified squads unless announced.
4. Abusive language, distracting the opponent, physical interference, deliberate disconnection, or damaging equipment results in penalties or disqualification.
5. If a verified technical failure occurs, the official will decide whether to resume with the existing score/time or replay the match.
6. A draw in a knockout match will be decided by extra time and penalties under the announced settings.
7. The event official's decision is final and binding.

Manpower
• 1 Event Head
• 1 Fixture and Result Coordinator
• 2 Match Volunteers/Referees
• 1 Technical Support Volunteer

Possible Problems & Solutions
• Controller or device failure: Test equipment before each round and keep at least one verified backup controller/device.
• Fixture delay: Use numbered fixtures, call the next players early, and apply the late-reporting rule consistently.
• Intentional disconnection: Record the score and time; the official may award a forfeit or resume from an equivalent match state.
• Settings dispute: Display approved settings beside the match area and have both players confirm them before kickoff.

Committee Approach
Publish the bracket and settings before Round 1. Record every result with both players' confirmation, prepare the next fixture while the current match is running, and keep spectators behind a defined boundary.""",

    "shark-tank": """Stark Industries: The Pitch — Shark Tank / Business Pitch
"Pitch Bold. Think Bigger. Win Big."

Rules & Regulations
1. Teams may consist of 2 members. Each participant may represent only one team.
2. Teams must present an original business idea, startup concept, product, service, or social enterprise appropriate to the announced theme, if any.
3. Each team will receive a fixed slot (suggested: 5 minutes for pitching and 3 minutes for judges' questions).
4. The pitch should clearly cover the problem, proposed solution, target users, value proposition, market opportunity, competitors, revenue or sustainability model, feasibility, and next steps.
5. A slide deck, prototype, mock-up, or demo may be used. All files must be submitted in the announced format before the deadline.
6. Claims, statistics, financial projections, intellectual property, and endorsements must not be intentionally false or misleading. Sources should be identified when requested.
7. Existing concepts may be improved, but copied pitch decks or direct imitation without meaningful original contribution may be disqualified.
8. The order of presentation will be decided by draw or pre-published schedule. Late teams may be moved to the end or marked absent.
9. Time-limit violations will attract a predefined penalty. Judges may stop a pitch after the grace period.
10. Judging will consider problem clarity, innovation, market understanding, feasibility, business model, impact, presentation, and response to questions. Judges' decision is final.

Manpower
• 1 Event Head
• 2–3 Judges
• 1 Stage Moderator
• 1 Timekeeper
• 2 Technical/Registration Volunteers

Possible Problems & Solutions
• Presentation file failure: Collect decks early in PDF and PPTX formats and keep them on two devices.
• Pitch exceeds time: Show warning cards or signals at one minute remaining and at time-up; apply the same penalty to all teams.
• Unfair or aggressive questioning: The moderator should control Q&A and stop personal, discriminatory, or irrelevant questions.
• Copied idea dispute: Judge the originality of execution and require teams to disclose existing inspirations; avoid making legal ownership determinations during the event.

Committee Approach
Use one scoring sheet for every judge. Suggested scoring: Problem & Need 15 | Innovation 20 | Market/Users 15 | Business Model 15 | Feasibility 15 | Impact/Scalability 10 | Pitch/Q&A 10. Average judges' scores and document any penalty.""",

    "photography": """Spider-Verse: Frame Hunt — Photography Competition
"Capture the Moment. Own the Frame."

Rules & Regulations
1. Individual participation only.
2. The theme will be announced at the beginning of the competition.
3. Each participant must submit exactly one photograph based on the announced theme.
4. The photograph must be captured during the official competition period; previously captured photographs are strictly prohibited.
5. Participants may use a mobile phone or digital camera.
6. No editing, filters, enhancement, compositing, or post-processing is allowed. The original capture must be submitted.
7. The original file and metadata must be retained and produced if requested.
8. The photograph must be submitted through the official method before the deadline; late or multiple submissions may be rejected.
9. Participants must remain within the permitted photography area and must not enter restricted or unsafe locations.
10. Judging will consider relevance to theme, composition, creativity, lighting, storytelling, and technical quality. Judges' decision is final and binding.

Manpower
• 1 Event Head
• 1 Judge or Judging Team
• 2 Volunteers — Registration and Submission

Possible Problems & Solutions
• Old photographs: Check the original file and metadata where necessary and ask the participant to explain the location and capture process.
• Submission failure: Use a fixed folder/form and keep a USB or offline transfer backup.
• Participants leaving campus: Define the permitted area on a map and announce restricted zones before starting.
• Editing dispute: Accept only the original file and compare metadata or camera preview where required.
• Consent or privacy complaint: Remove the image from judging until the Event Head verifies consent and appropriateness.

Committee Approach
Define the theme, time window, allowed area, file-naming format, and submission point in the opening briefing. Example: capture between 10:00 AM and 12:00 PM and submit one original image by 12:15 PM. Preserve originals until results are announced.""",

    "reels-competition": """Deadpool: Reel Chaos — Reels Competition
"Create Chaos. Go Viral."

Rules & Regulations
1. Individual participation only.
2. The theme will be announced at the start. The reel must be planned and recorded during the official competition period.
3. The final reel must follow the announced duration (suggested: 30 to 60 seconds) and must be submitted before the deadline.
4. Mobile editing applications may be used. Stock assets, templates, music, sound effects, and AI-generated elements must comply with the announced policy and should be disclosed when requested.
5. Previously completed videos or substantially pre-edited reels are prohibited. Organizers may request raw clips or project files.
6. Filming must remain within permitted areas and must not obstruct classes, traffic, emergency access, or other events.
7. Participants must obtain consent before prominently featuring non-team members. Pranks, harassment, dangerous stunts, property damage, and unauthorized recording in private areas are prohibited.
8. Content must not be obscene, hateful, discriminatory, defamatory, politically inflammatory, or damaging to the institution's reputation.
9. Judging will consider theme relevance, originality, storytelling, editing, audio-visual quality, engagement, and overall impact. Judges' decision is final.

Manpower
• 1 Event Head
• 1–2 Judges
• 2 Submission/Area Volunteers
• 1 Technical Coordinator

Possible Problems & Solutions
• Use of old footage: Request raw clips with timestamps or inspect project files where necessary.
• Copyrighted audio: Encourage royalty-free, licensed, or platform-cleared audio and ask teams to identify the track used.
• Unsafe or disruptive filming: Brief permitted areas and authorize volunteers to stop dangerous or disruptive activity immediately.
• Large-file upload failure: Set an MP4 format and resolution limit and provide local transfer/USB backup.
• Consent complaint: Require removal of disputed footage or disqualify the entry if consent and privacy rules were ignored.

Committee Approach
Announce theme, duration, aspect ratio, file format, permitted areas, and AI/stock-media policy together. Give a final upload window, verify that each file plays correctly, and keep one unmodified master copy for judging.""",

    "group-dance": """Guardians of the Galaxy: Dance Off — Group Dance
"Own the Beat. Rule the Galaxy."

Rules & Regulations
1. Each team must have 4 to 8 performers. Only registered members may perform.
2. Performance duration should be 5 minutes including entry and exit. Exceeding the limit will attract a penalty.
3. Music must be submitted before the announced deadline in MP3 format, with a backup copy carried by the team.
4. Teams must report to the holding area at least 30 minutes before their slot. The performance order will be decided by draw or schedule.
5. Lyrics, gestures, costumes, and themes must not be obscene, hateful, discriminatory, or targeted at individuals or communities.
6. Fire, smoke, liquids, glass, sharp objects, explosives, confetti that creates a hazard, and other dangerous props are prohibited.
7. Props must be declared in advance, be movable within the allotted transition time, and must not damage or dirty the stage.
8. Teams are responsible for safe choreography. Dangerous lifts or acrobatics may be stopped by the Stage Manager.
9. A music restart will be allowed only for a verified organizer-side technical failure and normally only once.
10. Judging will consider choreography, synchronization, creativity, technique, expressions, costumes, stage use, energy, and overall impact. Judges' decision is final.

Manpower
• 1 Event Head
• 2–3 Judges
• 1 Stage Manager
• 1 Sound/Technical Operator
• 2 Backstage Volunteers
• 1 Timekeeper

Possible Problems & Solutions
• Wrong or corrupted audio: Collect and test tracks in advance, rename files with team number, and keep a second device and team backup.
• Stage delay: Keep the next two teams ready and enforce prop setup/removal time.
• Unsafe move or injury: Inspect risky props, keep first aid accessible, and empower the Stage Manager to stop the act.
• Judging dispute: Use a common scoring rubric and prevent participants from approaching judges directly.

Committee Approach
Conduct stage measurement and audio testing before the event. Suggested scoring: Choreography 20 | Synchronization 20 | Creativity 15 | Technique 15 | Expressions/Stage Presence 15 | Costume/Theme 5 | Overall Impact 10.""",

    "treasure-hunt": """The Dark Knight: Hunt for the Signal — Treasure Hunt
"Follow the Clues. Become the Legend."

Rules & Regulations
1. Teams must consist of 4 members. Team membership cannot change after the hunt begins.
2. All teams will receive the first clue at the official start. Clues must be solved in the prescribed order unless stated otherwise.
3. Teams must remain within the marked campus boundaries and must not enter classrooms, offices, laboratories, rooftops, construction zones, roads, or other restricted areas unless a clue explicitly permits access.
4. Running in unsafe areas, climbing, forcing locks, moving institutional property, damaging clues, and disturbing other events are prohibited.
5. Teams may not share clues, answers, locations, photographs, or passwords with another team or interfere with another team's progress.
6. Use of phones, internet, maps, calls, or external help will follow the policy announced at briefing. Unauthorized outside assistance is prohibited.
7. Every checkpoint must be validated by the assigned volunteer before the next clue is issued.
8. A missing or damaged clue must be reported immediately; teams must not create, relocate, or conceal clues.
9. The winner is the first eligible team to complete all checkpoints and the final task correctly. Time penalties apply for hints or violations as announced.

Manpower
• 1 Event Head
• 1 Control-Room Coordinator
• 1 Volunteer per Active Checkpoint
• 2 Route/Safety Marshals
• 1 Time and Result Recorder

Possible Problems & Solutions
• Clue is lost or moved: Keep duplicate sealed clue sets and station volunteers at sensitive checkpoints.
• Teams follow one another: Use staggered starts, alternate clue orders, or parallel routes where possible.
• Unsafe access: Physically mark restricted zones and place marshals at high-risk junctions.
• Answer dispute: Maintain an official answer key and checkpoint log with timestamps.
• External help: State the phone policy clearly and monitor checkpoints; apply the published penalty consistently.

Committee Approach
Test every route and clue before the event, calculate safe walking time, prepare duplicate clue packets, brief checkpoint volunteers with accepted answers, and run all communication through one control room.""",

    "cold-investigation": """Batman: Gotham Files — Cold Investigation
"Every Clue Lies. Find the Truth."

Rules & Regulations
1. Teams must consist of 2 to 4 members. Only registered members may discuss or submit the solution.
2. Each team will receive the same case file, evidence set, witness statements, and task instructions at the start.
3. Teams must analyze only the provided evidence. Internet searches, outside help, photographing another team's materials, and exchanging information are prohibited unless a research phase is explicitly announced.
4. Evidence packets must not be marked, altered, removed, or shared. Any physical evidence must remain at its assigned station.
5. Teams may question role-play witnesses only during assigned slots and only through respectful, case-related questions.
6. The final submission must identify the conclusion/suspect, timeline or reasoning, key evidence, and answers to all required questions.
7. Unsupported accusations, offensive profiling, or conclusions based on caste, religion, gender, disability, appearance, or other protected traits will not be accepted.
8. Hints, if offered, will carry a published time or score penalty.
9. Submission after the deadline may receive a penalty or be rejected. Once submitted, answers cannot be altered.
10. Judging will consider correctness, evidence use, logical reasoning, completeness, and clarity. Judges' decision is final.

Manpower
• 1 Event Head
• 1 Case Master/Judge
• 2 Evidence or Witness Volunteers
• 1 Timekeeper
• 1 Submission Coordinator

Possible Problems & Solutions
• Case ambiguity: Pilot-test the case with non-participants and prepare an authoritative solution and accepted reasoning paths.
• Evidence leakage: Use numbered sealed packets, collect every packet, and keep witnesses isolated from waiting teams.
• Teams overhear others: Separate work areas and schedule witness questioning privately.
• Scoring dispute: Score against an evidence-based answer key, award partial marks using written criteria, and retain submissions.

Committee Approach
Issue identical sealed files, record opening time, control witness access, announce time warnings, and collect a signed final answer sheet. Suggested scoring: Correct Conclusion 25 | Evidence Identification 25 | Logical Reconstruction 25 | Completeness 15 | Presentation 10.""",

    "escape-room": """Doctor Strange: Multiverse Escape — Escape Room
"One Room. Infinite Realities. Escape."

Rules & Regulations
1. Teams must consist of 2 to 4 members. Only one team may enter a room/session at a time unless parallel identical rooms are used.
2. Teams must complete the puzzles and final objective within the announced time limit.
3. Participants may handle only items identified as part of the game. Locked, taped, labelled 'Do Not Touch,' electrical, ceiling, faculty, and emergency equipment must not be disturbed.
4. No force is required. Breaking, bending, climbing, unscrewing, disconnecting, or damaging any object is prohibited.
5. Phones, smart watches, internet access, outside communication, tools, and photography are prohibited inside unless specifically included in the game.
6. Teams must not reveal puzzles, codes, solutions, room layout, or photographs to waiting participants.
7. Hints may be requested through the official method and will carry the published time or score penalty.
8. A safety instruction or stop command from the Room Master must be followed immediately. Participants may leave at any time in an emergency.
9. The winning team will be determined by successful completion, then lowest adjusted time after hint/penalty additions.
10. Any damaged or missing component must be reported immediately. Officials' decision is final.

Manpower
• 1 Event Head
• 1 Room Master per Room
• 1 Reset/Puzzle Volunteer per Room
• 1 Queue and Time Coordinator
• 1 Safety Volunteer

Possible Problems & Solutions
• Puzzle component missing or reset incorrectly: Use a reset checklist and photograph the correct starting state before every session.
• Participant panic or injury: Keep exits unlocked, explain the emergency signal, monitor continuously, and maintain clear walkways.
• Solution leakage: Collect phones or seal them, separate completed and waiting teams, and require confidentiality until all sessions finish.
• Equipment failure: Prepare duplicate locks, clues, batteries, and manual override codes.
• Disputed completion time: Use one official timer and maintain a session log signed by the Room Master.

Committee Approach
Run multiple full test sessions before the event. Brief teams on safety and prohibited areas, start the official timer only after the door briefing, record every hint, stop immediately on completion, and reset using a checklist before admitting the next team.""",

    "master-cook": """Iron Chef: Battle of Heroes — Master Cook
"Enter Hungry. Leave Legendary."

Rules & Regulations
1. Individual participation only. Each participant must prepare and present their own dish or task.
2. The competition will be conducted in multiple rounds. Each round will have a different cooking challenge or task, and the details will be disclosed only at the beginning of that round. The college will provide the ingredients required for each round.
3. Participants must bring their own pans, vessels, knives, cutting boards, spoons, mixing bowls, and any other necessary cooking utensils or equipment. All preparation, cooking, plating, and workstation cleaning must be completed within the time announced for each round.
4. Participants must disclose major allergens in every dish and must not use spoiled, unsafe, prohibited, or unlabeled ingredients.
5. Hands, utensils, cutting boards, and work surfaces must be kept clean. Raw and ready-to-eat foods must be separated to prevent cross-contamination.
6. Pre-cooked, pre-prepared, or partially prepared food must not be brought. Only safe and approved cooking equipment may be used. Open flames and high-risk equipment are prohibited unless specifically arranged and supervised.
7. Appropriate clothing, tied hair, closed footwear, and safe knife handling are mandatory. Running and horseplay are prohibited.
8. Each participant must complete and present the required dish or task before the time for that round expires. Qualification or elimination for subsequent rounds will follow the format announced by the organizers.
9. Judges may refuse to taste food that appears unsafe, undercooked, contaminated, or allergen-unclear.
10. Judging will consider taste, creativity, presentation, hygiene, proper use of the provided ingredients, and overall performance. Judges' decision is final.

Manpower
• 1 Event Head
• 2–3 Food Judges
• 1 Food-Safety/Faculty Supervisor
• 2 Workstation Volunteers
• 1 Timekeeper
• 1 Electrical/Fire-Safety Support Person

Possible Problems & Solutions
• Allergy or food-safety risk: Collect ingredient/allergen declarations, keep first aid and emergency contacts available, and prohibit tasting of unsafe dishes.
• Electrical overload: Pre-calculate appliance load, assign sockets, avoid personal extension boards, and keep a suitable extinguisher nearby.
• Ingredient dispute: Ensure the same college-provided ingredients are distributed fairly to participants for each round.
• Equipment issue: Clearly state that participants must bring their own pans, vessels, utensils, and other required cooking equipment.
• Waste and cleaning: Provide labeled waste bins and require workstation clearance before the participant leaves.

Committee Approach
Distribute the college-provided ingredients equally for each round, inspect participant-brought equipment at reporting, brief hygiene and emergency rules, allocate equal workstations, announce each round challenge at the start of that round, give time warnings, and record qualification or elimination before proceeding to the next round.""",

    "ultimate-marketing-challenge": """LexCorp vs Stark Industries — The Ultimate Marketing Challenge
"Think. Persuade. Dominate."

Rules & Regulations
1. Teams must consist of 2 to 4 members. Each participant may represent only one team.
2. The event may contain multiple rounds. Round details will be announced before each stage.
3. Teams must work only within the announced preparation time and use only approved materials, devices, research sources, and AI tools.
4. All campaign ideas, slogans, visuals, and pitches created for the competition must be substantially original. Existing brands may be referenced only as required by the task.
5. Content must not be obscene, deceptive, defamatory, discriminatory, politically inflammatory, or harmful to individuals, communities, competitors, or the institution.
6. If a surprise product or case is assigned, teams may not exchange products, briefs, confidential prompts, or answers with other teams.
7. Every member should contribute; however, the team may nominate presenters for individual rounds.
8. Presentations must remain within the fixed time. Late submission or exceeding presentation time will attract the announced penalty.
9. Judges may ask questions about target audience, insight, positioning, channel choice, budget, ethics, feasibility, and measurement.
10. Elimination and tie-break rules will be announced before the event. Judges' decision is final and binding.

Manpower
• 1 Event Head
• 2–3 Marketing/Business Judges
• 1 Round Moderator
• 1 Timekeeper and Score Coordinator
• 2 Material/Technical Volunteers

Possible Problems & Solutions
• Copied campaign: Request working notes, check obvious copied slogans/assets, and score originality of strategy and execution.
• Unclear round instructions: Prepare written briefs with deliverables, time, permitted tools, and scoring criteria; read the same clarification to every team.
• Biased evaluation: Use at least two judges and a standard score sheet for each round.
• Presentation failure: Collect files before the pitch and accept a PDF backup.
• Offensive or misleading campaign: The moderator may stop the presentation and refer it to the Event Head for penalty or disqualification.

Committee Approach
Publish the round structure and elimination method before starting. For a final campaign round, suggested scoring: Consumer Insight 15 | Creativity 20 | Strategy/Positioning 20 | Feasibility 15 | Communication 15 | Ethics 5 | Presentation/Q&A 10. Preserve score sheets until results are final.""",
}

COMMON_RULES_FOOTER = """
---
Common Rules for All College Events
• Participants must carry valid college identification and complete registration verification before competing.
• Reporting time, venue, team size, eligibility, and event-specific requirements must be followed. Late entry is subject to the Event Head's decision.
• Misconduct, harassment, discrimination, intoxication, violence, property damage, cheating, or deliberate disruption can lead to immediate removal and disqualification.
• Participants are responsible for personal belongings and devices. Organizers should maintain a lost-and-found point but cannot guarantee recovery.
• Event officials may photograph or record activities for documentation and promotion subject to institutional policy. Privacy-sensitive events must follow their specific consent rules.
• Any medical, safety, electrical, crowd, or security concern must be reported immediately to the Event Head or faculty coordinator.
• Complaints must be submitted only through the team leader/participant to the Event Head within the announced dispute window. Participants must not confront judges directly.
• Judges' decisions on evaluation are final. The organizing committee may decide procedural matters not explicitly covered by the rules.
• The organizing committee may revise schedules, venues, formats, or rules when required for safety or operational reasons, with equal notice to affected participants.

Recommended Control Documents
• Registration and attendance sheet
• Published rule sheet and scoring rubric
• Fixture/slot/round schedule
• Time and penalty log
• Incident and technical-issue log
• Judge score sheets
• Provisional result sheet and dispute record
• Final signed result sheet
"""


class Command(BaseCommand):
    help = "Update official MacFiesta 2026 college event rules from the approved rulebook."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would be updated without writing to the database.",
        )

    def handle(self, *args, **options):
        dry = options["dry_run"]
        updated = 0
        missing = []

        for slug, rules_text in RULES.items():
            full_rules = rules_text.strip() + "\n" + COMMON_RULES_FOOTER.strip()
            try:
                event = Event.objects.get(slug=slug)
                if event.rules != full_rules:
                    if not dry:
                        event.rules = full_rules
                        event.save(update_fields=["rules"])
                    self.stdout.write(
                        self.style.SUCCESS(f"{'[DRY] ' if dry else ''}UPDATED rules: {slug}")
                    )
                    updated += 1
                else:
                    self.stdout.write(f"OK     {slug} (unchanged)")
            except Event.DoesNotExist:
                missing.append(slug)
                self.stdout.write(
                    self.style.WARNING(f"NOT FOUND — {slug} (run sync_macfiesta_2026_events first)")
                )

        self.stdout.write("")
        self.stdout.write(
            f"Done. {'[DRY RUN] ' if dry else ''}updated={updated} missing={len(missing)}"
        )
        if missing:
            self.stdout.write("Missing slugs: " + ", ".join(missing))
            self.stdout.write(
                "Run: python manage.py sync_macfiesta_2026_events  then re-run this command."
            )
