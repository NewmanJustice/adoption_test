/**
 * Pilot Specification Content
 * Converted from .business_context/Specification-Led-Agentic-Delivery-Pilot.md
 */

export interface PilotSection {
  id: string;
  title: string;
  content: string;
  children?: PilotSection[];
}

export const pilotSpecificationData: PilotSection[] = [
  {
    id: 'core-hypothesis',
    title: 'Core Hypothesis',
    content: `### High-maturity problem understanding + explicit system specification + agentic execution + short SME feedback loops = step-change in delivery predictability and quality.

What this body of work looks to explore.

**1️⃣ Specification quality is upstream of velocity**  
Poor velocity is not a coding problem — it's a specification maturity problem.

**2️⃣ Problem understanding has levels**  
You can't "build correctly" if you haven't climbed the hierarchy:
- **Level 1 – Foundational hygiene (Non-Negotiable)** Can this service be built safely at all?
- **Level 2 – Stability & control** Can the service absorb change without losing coherence?
- **Level 3 – Coordination & flow** Can multiple teams, roles, and systems move together predictably?
- **Level 4 – Confidence & assurance** Can the service be trusted by delivery, operations, judiciary, external users, and leadership?
- **Level 5 – Delivery self-actualisation** Does the service deliver successfully and transition cleanly into BAU?

**3️⃣ Agents change the economics of iteration**  
Historically:
- Spec refinement is expensive
- UI iteration is expensive
- Rework is catastrophic

With agents:
- Spec mutation is cheap
- Prototype regeneration is near-zero cost
- Feedback loop compression is possible

So the constraint shifts from "engineering capacity" to "clarity of thought".`
  },
  {
    id: 'purpose',
    title: '1. Purpose',
    content: `This proposal seeks to run a bounded pilot evaluating a Specification-Led Agentic Delivery model within a controlled lifecycle-rich domain.

The objective is to test whether combining:

- The CFT Software Engineering Hierarchy of Needs
- The Four Structural Preconditions
- A named human technical authority ("Builder")
- Agent-augmented specification workflows
- Continuous SME feedback loops

results in measurable improvements in structural clarity, rework reduction, non-functional posture, and delivery predictability.

This pilot is not a tooling trial.  
It is a structural engineering experiment.`
  },
  {
    id: 'context',
    title: '2. Context',
    content: `Complex lifecycle-driven services frequently exhibit predictable instability patterns:

- Early UI-first sequencing without lifecycle clarity
- Late discovery of exceptional paths
- Post-implementation state mutation
- NFR gaps discovered during integration
- Dependency invalidation
- Governance compensating for structural ambiguity
- Rework as the mechanism of clarification

Agentic tooling reduces the cost of iteration.  
It does not eliminate structural risk.

This pilot tests whether structural maturity + agentic acceleration produces measurable improvement.`
  },
  {
    id: 'structural-preconditions',
    title: '3. Structural Preconditions for Stable Agentic Delivery',
    content: `Agentic tooling reduces iteration cost. It does not reduce the need for structure.

The pilot operates explicitly against four Structural Preconditions.`,
    children: [
      {
        id: 'clear-authority',
        title: '3.1 Clear Authority and Accountability',
        content: `Delivery requires a named human technical authority ("Builder") accountable for:

- Architectural coherence
- Lifecycle integrity
- Sequencing decisions
- Specification stability

**Design:**
- Single named Builder
- Explicit sequencing authority
- Direct SME access
- No committee-based arbitration
- Escalations logged and measured

Agents augment.  
Authority remains human.`
      },
      {
        id: 'service-intent',
        title: '3.2 Explicit Service Intent and Boundaries',
        content: `Before generation begins:

- Outcome statement agreed
- Service boundary defined
- Transformation intent articulated
- Out-of-scope recorded

Prototype generation is prohibited until stable.

Without boundary clarity, acceleration amplifies misdirection.`
      },
      {
        id: 'lifecycle-modelling',
        title: '3.3 Explicit Lifecycle and Operational Modelling',
        content: `Before implementation:

- Domain model defined
- State model defined
- Event model articulated
- Exceptional paths identified
- Time-based transitions identified
- Operational behaviour treated as explicit input

UI generation is driven from lifecycle artefacts.

States exist before screens.`
      },
      {
        id: 'architectural-discipline',
        title: '3.4 Architectural and Dependency Discipline',
        content: `Before implementation:

- NFR envelope defined
- Dependencies enumerated
- Temporary decisions logged with exit paths
- Observability defined

Acceleration without guardrails increases fragility.

Architectural discipline ensures safe acceleration.`
      }
    ]
  }
];
  {
    id: 'specification-based-development',
    title: '4. Specification-Based Development in an Agentic World',
    content: ``,
    children: [
      {
        id: 'structural-shift',
        title: '4.1 The Structural Shift',
        content: `Traditional delivery often follows:

\`\`\`
Idea → Stories → Code → Rework
\`\`\`

Understanding emerges during implementation.  
Rework stabilises ambiguity.

Specification-Led Agentic Delivery reframes the sequence:

\`\`\`
Outcome → Domain Model → State Model → Event Model → Specification → Prototype → SME Feedback → Code
\`\`\`

Iteration remains.  
But lifecycle clarity precedes implementation.`
      },
      {
        id: 'stage-by-stage',
        title: '4.2 Stage-by-Stage Model',
        content: `**Outcome** - Defines success conditions, transformation intent, and boundaries.

**Domain Model** - Defines actors, entities, invariants, constraints.

**State Model** - Defines what states exist and what "live" means.

**Event Model** - Defines legal transitions, exceptional paths, time-based triggers.

**Specification** - Structured artefact combining lifecycle and NFR envelope.

**Prototype** - Generated from specification. Mutation cost is low.

**SME Feedback** - Structured, categorised, mapped back to specification.

**Code** - Expression of stable intent.

Rework shifts left — before code exists.`
      },
      {
        id: 'role-of-agents',
        title: '4.3 The Role of Agents',
        content: `Agents accelerate:

- Domain consistency checks
- State integrity validation
- Transition legality analysis
- Dependency surfacing
- NFR alignment checks
- Prototype regeneration

Agents do not:

- Decide sequencing
- Replace authority
- Infer ambiguous operational behaviour

Acceleration follows clarity.`
      }
    ]
  },
  {
    id: 'pilot-scope',
    title: '5. Pilot Scope',
    content: `The pilot will operate within a bounded lifecycle-rich domain meeting the following criteria:

- Minimum 4–6 distinct states
- At least one exceptional path
- At least one external dependency
- At least one NFR stressor
- Clear SME availability
- Limited blast radius

No platform-critical domain will be used.`
  },
  {
    id: 'operating-model',
    title: '6. Operating Model',
    content: ``,
    children: [
      {
        id: 'phase-1',
        title: 'Phase 1 – Structural Foundation (Week 1)',
        content: `Deliver:

- Outcome statement
- Domain model
- State model
- Event model
- NFR envelope
- Dependency map

No implementation begins.

Spec Freeze timestamp defined.`
      },
      {
        id: 'phase-2',
        title: 'Phase 2 – Agentic Specification Loops (Weeks 2–3)',
        content: `Loop cycle (≤48 hours):

1. Generate prototype
2. SME annotate
3. Mutate specification
4. Regenerate
5. Builder coherence validation

Goal: structural stability before implementation.`
      },
      {
        id: 'phase-3',
        title: 'Phase 3 – Controlled Implementation (Week 4+)',
        content: `- Implementation scaffold generated from stable specification
- Traceability matrix maintained
- Deviations logged
- Structural mutation tracked post-freeze

Parallel control sprint run for comparison.`
      }
    ]
  },
  {
    id: 'evaluation-framework',
    title: '7. Evaluation Framework',
    content: ``,
    children: [
      {
        id: 'structural-maturity',
        title: '7.1 Structural Maturity Metrics',
        content: `**Lifecycle Stability Index** - ≥80% state model stable pre-build.

**Exceptional Path Discovery Timing** - ≥75% identified pre-build.

**Boundary Drift Rate** - ≤2 structural reinterpretations.`
      },
      {
        id: 'delivery-predictability',
        title: '7.2 Delivery Predictability Metrics',
        content: `**Spec-to-Build Variance** - <10% untraceable behaviours.

**Post-Implementation Rework** - ≥40% reduction vs control sprint.

**Delivery Confidence Score** - Upward trend across pilot.`
      },
      {
        id: 'nfr-assurance',
        title: '7.3 Non-Functional Assurance Metrics',
        content: `**NFR Defect Density** - ≥30% reduction vs control sprint.

**Dependency Shock Events** - Zero major post-build invalidations.`
      },
      {
        id: 'sme-alignment',
        title: '7.4 SME Alignment Metrics',
        content: `**SME Clarity Score** - Upward trend across loops.

**Feedback Cycle Time** - ≤48 hours average.`
      },
      {
        id: 'governance-authority',
        title: '7.5 Governance & Authority Metrics',
        content: `**Decision Latency** - ≤72 hours.

**Escalation Count** - ≤2 during pilot.`
      }
    ]
  },
  {
    id: 'dashboard-structure',
    title: '8. Dashboard Structure',
    content: ``,
    children: [
      {
        id: 'quadrant-1',
        title: 'Quadrant 1 – Structural Integrity',
        content: `- Lifecycle Stability %
- Exceptional Path Pre-Discovery %
- Boundary Drift Count
- State Mutation Count`
      },
      {
        id: 'quadrant-2',
        title: 'Quadrant 2 – Predictability',
        content: `- Spec-to-Build Variance
- Rework Count
- Delivery Confidence
- Escalation Count`
      },
      {
        id: 'quadrant-3',
        title: 'Quadrant 3 – Non-Functional Posture',
        content: `- NFR Defect Density
- Dependency Shock Events
- NFR Coverage %`
      },
      {
        id: 'quadrant-4',
        title: 'Quadrant 4 – SME Alignment',
        content: `- Clarity Score Trend
- Feedback Cycle Time
- Exceptional Path Timing`
      }
    ]
  },
  {
    id: 'risk-mitigation',
    title: '9. Risk and Mitigation',
    content: `**Self-Reported Bias** - Mitigation: Pair subjective scores with structural metrics.

**Control Sprint Comparability** - Mitigation: Match lifecycle complexity and team composition.

**Tagging Discipline Failure** - Mitigation: Predefine minimal defect categories; assign tagging responsibility.

**Overfitting to Domain** - Mitigation: Select domain with real lifecycle complexity and dependency load.

**Metric Overload** - Mitigation: Executive dashboard reduces noise.`
  },
  {
    id: 'exit-criteria',
    title: '10. Exit Criteria',
    content: `The pilot will be considered successful if:

- ≥40% reduction in post-implementation rework
- ≥30% reduction in NFR defect density
- ≥80% lifecycle stability pre-build
- Upward SME clarity trend
- Improved delivery predictability
- Low escalation rate`
  },
  {
    id: 'final-position',
    title: 'Final Position',
    content: `This pilot is a controlled, reversible engineering experiment designed to test whether applying structural maturity with agentic augmentation:

- Strengthens lifecycle coherence
- Reduces structural rework
- Improves non-functional posture
- Increases delivery confidence`
  }
];
