#!/usr/bin/env python3
"""CLI tool for coordination health validation.

Runs stress tests against the multi-agent coordination system and validates
that the coordination failure rate is below acceptable thresholds.

Usage:
    python scripts/validate_coordination.py --requests 100 --threshold 0.05
    python scripts/validate_coordination.py --help
"""

import asyncio
import argparse
import sys
from datetime import datetime
from typing import List, Dict, Any
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from suna.backend.core.agents.supervisor import create_supervisor_graph


def generate_test_queries(num_requests: int) -> List[str]:
    """Generate varied test queries for coordination validation.

    Args:
        num_requests: Number of test queries to generate

    Returns:
        List of diverse test queries covering all agent capabilities
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

    materials = [
        "concrete", "steel", "aluminum", "glass", "wood",
        "brick", "ceramic", "insulation", "gypsum", "paint"
    ]

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


def analyze_results(results: List[Any]) -> Dict[str, Any]:
    """Analyze stress test results and extract metrics.

    Args:
        results: List of results from asyncio.gather (includes exceptions)

    Returns:
        Dictionary with analysis metrics
    """
    total = len(results)
    failures = [r for r in results if isinstance(r, Exception)]
    successes = [r for r in results if not isinstance(r, Exception)]

    failure_rate = len(failures) / total if total > 0 else 0.0

    # Analyze agent coverage
    agent_counts = {}
    for result in successes:
        if isinstance(result, dict):
            if "agent_history" in result:
                for agent in result["agent_history"]:
                    agent_counts[agent] = agent_counts.get(agent, 0) + 1
            elif "current_agent" in result:
                agent = result["current_agent"]
                agent_counts[agent] = agent_counts.get(agent, 0) + 1

    # Categorize failures by type
    failure_types = {}
    for failure in failures:
        error_type = type(failure).__name__
        failure_types[error_type] = failure_types.get(error_type, 0) + 1

    return {
        "total": total,
        "successes": len(successes),
        "failures": len(failures),
        "failure_rate": failure_rate,
        "agent_counts": agent_counts,
        "failure_types": failure_types,
        "failure_details": failures[:5],  # Keep first 5 for reporting
    }


async def validate_coordination(
    num_requests: int = 100,
    failure_threshold: float = 0.05
) -> bool:
    """Run coordination stress test and validate health.

    Args:
        num_requests: Number of concurrent requests to test
        failure_threshold: Maximum acceptable failure rate (0.0 to 1.0)

    Returns:
        True if validation passes, False otherwise
    """
    print(f"Starting coordination validation...")
    print(f"Requests: {num_requests}")
    print(f"Failure threshold: {failure_threshold * 100:.0f}%")
    print()

    # Create supervisor graph
    try:
        app = create_supervisor_graph()
    except Exception as e:
        print(f"ERROR: Failed to create supervisor graph: {e}")
        return False

    # Generate test queries
    queries = generate_test_queries(num_requests)

    # Execute stress test
    print(f"Executing {num_requests} concurrent requests...")
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
            config={"configurable": {"thread_id": f"validate-{i}"}}
        )
        for i, query in enumerate(queries)
    ]

    results = await asyncio.gather(*tasks, return_exceptions=True)
    end = datetime.now()

    # Analyze results
    duration = (end - start).total_seconds()
    analysis = analyze_results(results)

    # Print report
    print()
    print("=" * 70)
    print("COORDINATION VALIDATION REPORT")
    print("=" * 70)
    print()
    print(f"Execution Summary:")
    print(f"  Total requests:     {analysis['total']}")
    print(f"  Successful:         {analysis['successes']}")
    print(f"  Failed:             {analysis['failures']}")
    print(f"  Failure rate:       {analysis['failure_rate'] * 100:.2f}%")
    print(f"  Threshold:          {failure_threshold * 100:.0f}%")
    print()

    # Status determination
    passed = analysis['failure_rate'] < failure_threshold

    if passed:
        status_icon = "✅"
        status_text = "PASS"
    else:
        status_icon = "❌"
        status_text = "FAIL"

    print(f"Status: {status_icon} {status_text}")
    print()

    # Performance metrics
    print(f"Performance:")
    print(f"  Total duration:     {duration:.2f}s")
    print(f"  Avg response time:  {duration / analysis['total']:.2f}s")
    print()

    # Agent coverage
    if analysis['agent_counts']:
        print(f"Agent Invocations:")
        for agent, count in sorted(analysis['agent_counts'].items()):
            percentage = (count / analysis['total']) * 100
            print(f"  {agent:30s} {count:4d} ({percentage:5.1f}%)")
        print()

    # Failure analysis
    if analysis['failures'] > 0:
        print(f"Failure Analysis:")
        print(f"  Failure types:")
        for error_type, count in sorted(analysis['failure_types'].items()):
            print(f"    {error_type}: {count}")
        print()

        print(f"  Failure details (first 5):")
        for i, error in enumerate(analysis['failure_details'], 1):
            error_msg = str(error)[:80]
            print(f"    {i}. {type(error).__name__}: {error_msg}")
        if analysis['failures'] > 5:
            print(f"    ... and {analysis['failures'] - 5} more")
        print()

    # Recommendations
    if not passed:
        print("Recommendations:")
        if analysis['failure_rate'] > 0.10:
            print("  ⚠️  CRITICAL: Failure rate >10% - consider fallback to 6-agent system")
        elif analysis['failure_rate'] > 0.05:
            print("  ⚠️  WARNING: Failure rate >5% - investigate root causes before production")

        if analysis['failure_types']:
            most_common_error = max(analysis['failure_types'].items(), key=lambda x: x[1])
            print(f"  • Most common error: {most_common_error[0]} ({most_common_error[1]} occurrences)")

        print()

    print("=" * 70)
    print()

    return passed


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Validate multi-agent coordination health",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run with default settings (100 requests, 5% threshold)
  python scripts/validate_coordination.py

  # Run with more requests for thorough testing
  python scripts/validate_coordination.py --requests 200

  # Use stricter threshold
  python scripts/validate_coordination.py --threshold 0.03

  # Quick smoke test
  python scripts/validate_coordination.py --requests 10
        """
    )

    parser.add_argument(
        "--requests",
        type=int,
        default=100,
        help="Number of concurrent test requests (default: 100)"
    )

    parser.add_argument(
        "--threshold",
        type=float,
        default=0.05,
        help="Failure rate threshold (0.0-1.0, default: 0.05 = 5%%)"
    )

    args = parser.parse_args()

    # Validate arguments
    if args.requests < 1:
        print("ERROR: --requests must be at least 1")
        sys.exit(1)

    if not 0.0 <= args.threshold <= 1.0:
        print("ERROR: --threshold must be between 0.0 and 1.0")
        sys.exit(1)

    # Run validation
    try:
        success = asyncio.run(validate_coordination(args.requests, args.threshold))
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\nValidation interrupted by user")
        sys.exit(130)
    except Exception as e:
        print(f"\n\nERROR: Validation failed with exception: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
