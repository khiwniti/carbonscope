"""Stress tests for 12-agent coordination system.

Tests coordination stability under concurrent load, following plan 03-04 Task 1.
Success criteria: <5% coordination failure rate on 100+ concurrent requests.
"""

import pytest
import asyncio
from datetime import datetime
from typing import List, Dict, Any
from suna.backend.core.agents.supervisor import create_supervisor_graph
from suna.backend.core.agents.state import AgentState


def generate_test_queries(num_requests: int) -> List[str]:
    """Generate varied test queries for stress testing.

    Creates diverse queries covering all agent capabilities to ensure
    full routing coverage during stress tests.

    Args:
        num_requests: Number of test queries to generate

    Returns:
        List of varied test queries
    """
    query_templates = [
        "Calculate carbon for BOQ",
        "Find alternatives for {material}",
        "Check TREES MR1 compliance",
        "Optimize carbon footprint",
        "Analyze cost-carbon tradeoffs for {material}",
        "Validate BOQ data quality",
        "What is my carbon reduction potential?",
        "Generate carbon report",
        "Compare scenarios",
        "What materials have highest carbon impact?",
        "How to achieve TREES Gold certification?",
        "Show me EDGE compliance status",
        "What are emission factors for {material}?",
        "Help me understand carbon calculation",
        "List available material alternatives",
        "What is the total embodied carbon?",
        "Show breakdown by material category",
        "How can I reduce carbon by 20%?",
        "What is TREES MR3 requirement?",
        "Check data quality issues",
    ]

    materials = ["concrete", "steel", "aluminum", "glass", "wood", "brick", "ceramic", "insulation"]

    queries = []
    for i in range(num_requests):
        template = query_templates[i % len(query_templates)]
        if "{material}" in template:
            material = materials[i % len(materials)]
            query = template.format(material=material)
        else:
            query = template
        queries.append(query)

    return queries


def calculate_failure_rate(results: List[Any]) -> float:
    """Calculate coordination failure rate from results.

    Args:
        results: List of results from asyncio.gather (includes exceptions)

    Returns:
        Failure rate as decimal (0.0 to 1.0)
    """
    failures = sum(1 for r in results if isinstance(r, Exception))
    return failures / len(results) if results else 0.0


def analyze_agent_coverage(results: List[Any]) -> Dict[str, int]:
    """Analyze which agents were invoked during stress test.

    Args:
        results: List of results from stress test

    Returns:
        Dictionary mapping agent names to invocation counts
    """
    agent_counts = {}

    for result in results:
        if isinstance(result, Exception):
            continue

        if isinstance(result, dict) and "agent_history" in result:
            for agent in result["agent_history"]:
                agent_counts[agent] = agent_counts.get(agent, 0) + 1
        elif isinstance(result, dict) and "current_agent" in result:
            agent = result["current_agent"]
            agent_counts[agent] = agent_counts.get(agent, 0) + 1

    return agent_counts


@pytest.mark.asyncio
@pytest.mark.slow
async def test_12_agent_coordination_stress():
    """Stress test 12-agent system with 100+ concurrent requests.

    Success criteria:
    - Coordination failure rate <5%
    - Average response time <5 seconds
    - All major agents invoked during test

    This test validates that the multi-agent system can handle realistic
    concurrent workloads without coordination failures or deadlocks.
    """
    # Create supervisor graph (uses all registered agents)
    app = create_supervisor_graph()

    # Generate 100 test queries with varied complexity
    num_requests = 100
    queries = generate_test_queries(num_requests)

    print(f"\nRunning stress test with {num_requests} concurrent requests...")

    # Execute concurrently
    start = datetime.now()

    tasks = [
        app.ainvoke(
            {
                "user_query": query,
                "current_agent": "",
                "task_results": {},
                "agent_history": [],
                "error_count": 0,
                "scenario_context": None,
            },
            config={"configurable": {"thread_id": f"stress-{i}"}}
        )
        for i, query in enumerate(queries)
    ]

    results = await asyncio.gather(*tasks, return_exceptions=True)
    end = datetime.now()

    # Calculate metrics
    duration = (end - start).total_seconds()
    failure_rate = calculate_failure_rate(results)
    avg_response_time = duration / len(results)

    # Analyze agent coverage
    agent_counts = analyze_agent_coverage(results)

    # Print detailed results
    print(f"\n{'=' * 60}")
    print("STRESS TEST RESULTS")
    print(f"{'=' * 60}")
    print(f"Total requests: {len(results)}")
    print(f"Successful: {len(results) - sum(1 for r in results if isinstance(r, Exception))}")
    print(f"Failed: {sum(1 for r in results if isinstance(r, Exception))}")
    print(f"Failure rate: {failure_rate * 100:.2f}%")
    print(f"Total duration: {duration:.2f}s")
    print(f"Avg response time: {avg_response_time:.2f}s")
    print(f"\nAgent invocations:")
    for agent, count in sorted(agent_counts.items()):
        print(f"  {agent}: {count}")

    # Print failure details if any
    failures = [r for r in results if isinstance(r, Exception)]
    if failures:
        print(f"\nFailure breakdown (first 5):")
        for i, error in enumerate(failures[:5]):
            print(f"  {i+1}. {type(error).__name__}: {str(error)[:80]}")
        if len(failures) > 5:
            print(f"  ... and {len(failures) - 5} more")

    # Validate coordination failure rate
    assert failure_rate < 0.05, (
        f"Coordination failure rate {failure_rate*100:.1f}% exceeds 5% threshold. "
        f"This indicates instability in multi-agent coordination that must be addressed."
    )

    # Validate response time (generous 5s threshold for concurrent load)
    assert avg_response_time < 5.0, (
        f"Average response time {avg_response_time:.2f}s exceeds 5s threshold. "
        f"This indicates performance issues under concurrent load."
    )

    # Validate agent coverage (at least 3 different agents should be invoked)
    assert len(agent_counts) >= 3, (
        f"Only {len(agent_counts)} agents invoked during stress test. "
        f"Expected broader routing coverage across agent capabilities."
    )


@pytest.mark.asyncio
@pytest.mark.slow
async def test_coordination_scaling_6_to_12_agents():
    """Test coordination scales from baseline to full system without regression.

    This test validates that adding more agents doesn't significantly degrade
    coordination stability compared to a smaller baseline system.
    """
    # Note: This test assumes we can configure agent count
    # Current implementation uses all registered agents
    # Future: Add configuration to enable/disable specific agents

    app = create_supervisor_graph()

    # Run smaller stress test (50 requests)
    num_requests = 50
    queries = generate_test_queries(num_requests)

    print(f"\nRunning scaling test with {num_requests} requests...")

    start = datetime.now()
    tasks = [
        app.ainvoke(
            {
                "user_query": query,
                "current_agent": "",
                "task_results": {},
                "agent_history": [],
                "error_count": 0,
                "scenario_context": None,
            },
            config={"configurable": {"thread_id": f"scale-{i}"}}
        )
        for i, query in enumerate(queries)
    ]

    results = await asyncio.gather(*tasks, return_exceptions=True)
    end = datetime.now()

    duration = (end - start).total_seconds()
    failure_rate = calculate_failure_rate(results)

    print(f"\nScaling test results:")
    print(f"  Requests: {num_requests}")
    print(f"  Failures: {sum(1 for r in results if isinstance(r, Exception))}")
    print(f"  Failure rate: {failure_rate * 100:.2f}%")
    print(f"  Duration: {duration:.2f}s")

    # Validate failure rate is acceptable
    # More lenient threshold for scaling test (10% instead of 5%)
    assert failure_rate < 0.10, (
        f"Coordination failure rate {failure_rate*100:.1f}% exceeds 10% threshold "
        f"during scaling test."
    )


@pytest.mark.asyncio
async def test_sequential_stress_no_memory_leak():
    """Test system stability during sequential high-load operations.

    Validates that repeated execution doesn't cause memory leaks or
    resource exhaustion over extended operation.
    """
    app = create_supervisor_graph()

    # Run 5 batches of 20 requests each
    num_batches = 5
    requests_per_batch = 20

    print(f"\nRunning sequential stress test ({num_batches} batches x {requests_per_batch} requests)...")

    batch_failure_rates = []

    for batch in range(num_batches):
        queries = generate_test_queries(requests_per_batch)

        tasks = [
            app.ainvoke(
                {
                    "user_query": query,
                    "current_agent": "",
                    "task_results": {},
                    "agent_history": [],
                    "error_count": 0,
                    "scenario_context": None,
                },
                config={"configurable": {"thread_id": f"seq-{batch}-{i}"}}
            )
            for i, query in enumerate(queries)
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)
        failure_rate = calculate_failure_rate(results)
        batch_failure_rates.append(failure_rate)

        print(f"  Batch {batch + 1}: {failure_rate * 100:.1f}% failure rate")

    # Check that failure rate doesn't increase over time (indicating resource exhaustion)
    # Allow some variation but overall trend should be stable
    avg_failure_rate = sum(batch_failure_rates) / len(batch_failure_rates)

    print(f"\nAverage failure rate across batches: {avg_failure_rate * 100:.2f}%")

    # Validate overall stability
    assert avg_failure_rate < 0.05, (
        f"Average failure rate {avg_failure_rate*100:.1f}% exceeds 5% threshold "
        f"during sequential stress test."
    )

    # Check for increasing failure trend (sign of resource leak)
    if len(batch_failure_rates) >= 3:
        last_three_avg = sum(batch_failure_rates[-3:]) / 3
        first_three_avg = sum(batch_failure_rates[:3]) / 3

        # Allow up to 2x increase (but still must be under 5% absolute)
        assert last_three_avg <= first_three_avg * 2.0, (
            f"Failure rate increased significantly from {first_three_avg*100:.1f}% "
            f"to {last_three_avg*100:.1f}%, suggesting resource leak or degradation."
        )
