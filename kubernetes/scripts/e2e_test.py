#!/usr/bin/env python3
"""
CarbonScope BIM AI - Comprehensive E2E Test Suite
Validates the entire stack to prevent production errors
"""

import subprocess
import sys
import json
import time
from datetime import datetime
from pathlib import Path

class Colors:
    GREEN = '\033[0;32m'
    RED = '\033[0;31m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    NC = '\033[0m'

class E2ETestSuite:
    def __init__(self, namespace="carbonscope"):
        self.namespace = namespace
        self.passed = 0
        self.failed = 0
        self.results = []
        self.report_lines = []

    def run_command(self, cmd, capture=True):
        """Run a shell command and return output"""
        try:
            result = subprocess.run(
                cmd,
                shell=True,
                capture_output=capture,
                text=True,
                timeout=30
            )
            return result.returncode == 0, result.stdout, result.stderr
        except Exception as e:
            return False, "", str(e)

    def test(self, name, test_func):
        """Run a test and record results"""
        try:
            passed, message = test_func()
            if passed:
                print(f"{Colors.GREEN}✅ PASS{Colors.NC}: {name}")
                self.passed += 1
                status = "PASS"
            else:
                print(f"{Colors.RED}❌ FAIL{Colors.NC}: {name} - {message}")
                self.failed += 1
                status = "FAIL"

            self.results.append({
                'name': name,
                'status': status,
                'message': message
            })
            self.report_lines.append(f"- {'✅' if passed else '❌'} **{status}**: {name} - {message}")

        except Exception as e:
            print(f"{Colors.RED}❌ ERROR{Colors.NC}: {name} - {str(e)}")
            self.failed += 1
            self.results.append({
                'name': name,
                'status': 'ERROR',
                'message': str(e)
            })
            self.report_lines.append(f"- ❌ **ERROR**: {name} - {str(e)}")

    def run_all_tests(self):
        """Execute all test phases"""
        print(f"{Colors.BLUE}╔════════════════════════════════════════════════════════╗{Colors.NC}")
        print(f"{Colors.BLUE}║  CarbonScope E2E Test Suite - Production Validation   ║{Colors.NC}")
        print(f"{Colors.BLUE}╚════════════════════════════════════════════════════════╝{Colors.NC}")
        print()

        # Initialize report
        self.report_lines = [
            "# CarbonScope E2E Test Report",
            "",
            f"**Date**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            f"**Environment**: Local Kubernetes (Minikube)",
            f"**Namespace**: {self.namespace}",
            "",
            "---",
            "",
            "## Test Results",
            ""
        ]

        print(f"{Colors.YELLOW}═══ Phase 1: Infrastructure Tests ═══{Colors.NC}\n")
        self.test_infrastructure()

        print(f"\n{Colors.YELLOW}═══ Phase 2: Database Tests ═══{Colors.NC}\n")
        self.test_databases()

        print(f"\n{Colors.YELLOW}═══ Phase 3: Application Tests ═══{Colors.NC}\n")
        self.test_applications()

        print(f"\n{Colors.YELLOW}═══ Phase 4: Configuration Tests ═══{Colors.NC}\n")
        self.test_configuration()

        print(f"\n{Colors.YELLOW}═══ Phase 5: Production Readiness ═══{Colors.NC}\n")
        self.test_production_readiness()

        self.generate_report()

    def test_infrastructure(self):
        """Test cluster infrastructure"""
        # Test 1: Cluster connectivity
        self.test("Cluster Connectivity", lambda: (
            self.run_command("kubectl cluster-info")[0],
            "Kubernetes API accessible"
        ))

        # Test 2: Namespace exists
        self.test("Namespace Existence", lambda: (
            self.run_command(f"kubectl get namespace {self.namespace}")[0],
            f"Namespace '{self.namespace}' exists"
        ))

        # Test 3: Pod health
        def check_pods():
            success, output, _ = self.run_command(
                f"kubectl get pods -n {self.namespace} -o json"
            )
            if not success:
                return False, "Cannot get pod list"

            try:
                pods = json.loads(output)
                total = len(pods['items'])
                ready = sum(1 for pod in pods['items']
                           if all(c['ready'] for c in pod['status'].get('containerStatuses', [])))

                if total == ready:
                    return True, f"All {total} pods running and ready"
                return False, f"Only {ready}/{total} pods ready"
            except:
                return False, "Error parsing pod status"

        self.test("Pod Health", check_pods)

        # Test 4: Services exist
        def check_services():
            services = ['local-frontend', 'local-backend', 'local-postgres', 'local-redis']
            missing = []
            for svc in services:
                success, _, _ = self.run_command(f"kubectl get svc {svc} -n {self.namespace}")
                if not success:
                    missing.append(svc)

            if not missing:
                return True, f"All {len(services)} services exist"
            return False, f"Missing services: {', '.join(missing)}"

        self.test("Service Endpoints", check_services)

    def test_databases(self):
        """Test database connectivity and health"""
        # Test 5: PostgreSQL connection
        def check_postgres():
            success, output, _ = self.run_command(
                f"kubectl exec -n {self.namespace} local-postgres-0 -- "
                "psql -U carbonscope -c 'SELECT 1;'"
            )
            if success:
                # Get version
                success2, version, _ = self.run_command(
                    f"kubectl exec -n {self.namespace} local-postgres-0 -- "
                    "psql -U carbonscope -t -c 'SELECT version();'"
                )
                version_str = version.split('\n')[0].strip() if success2 else "unknown"
                return True, f"Connected - {version_str[:50]}"
            return False, "Cannot connect to database"

        self.test("PostgreSQL Connection", check_postgres)

        # Test 6: Database schema
        def check_schema():
            success, output, _ = self.run_command(
                f"kubectl exec -n {self.namespace} local-postgres-0 -- "
                "psql -U carbonscope -t -c "
                "\"SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';\""
            )
            if success:
                try:
                    count = int(output.strip())
                    if count > 0:
                        return True, f"{count} tables found"
                    return False, "No tables found - migrations may not have run"
                except:
                    return False, "Cannot parse table count"
            return False, "Cannot query database schema"

        self.test("Database Schema", check_schema)

        # Test 7: Redis connection
        def check_redis():
            success, output, _ = self.run_command(
                f"kubectl exec -n {self.namespace} local-redis-0 -- redis-cli ping"
            )
            if success and "PONG" in output:
                return True, "Redis responding"
            return False, "Redis not responding"

        self.test("Redis Connection", check_redis)

    def test_applications(self):
        """Test application health"""
        # Test 8: Backend pods running
        def check_backend():
            success, output, _ = self.run_command(
                f"kubectl get pods -n {self.namespace} -l app=backend -o jsonpath='{{.items[*].status.phase}}'"
            )
            if success and "Running" in output:
                return True, "Backend pods running"
            return False, "Backend pods not running"

        self.test("Backend Application", check_backend)

        # Test 9: Frontend pods running
        def check_frontend():
            success, output, _ = self.run_command(
                f"kubectl get pods -n {self.namespace} -l app=frontend -o jsonpath='{{.items[*].status.phase}}'"
            )
            if success and "Running" in output:
                return True, "Frontend pods running"
            return False, "Frontend pods not running"

        self.test("Frontend Application", check_frontend)

        # Test 10: Backend logs check
        def check_backend_logs():
            success, output, _ = self.run_command(
                f"kubectl logs -n {self.namespace} deployment/local-backend --tail=100"
            )
            if success:
                error_count = output.lower().count('error') + output.lower().count('exception')
                if error_count < 5:
                    return True, f"No critical errors ({error_count} errors found)"
                return False, f"{error_count} errors in logs"
            return False, "Cannot retrieve logs"

        self.test("Backend Error Logs", check_backend_logs)

        # Test 11: Frontend logs check
        def check_frontend_logs():
            success, output, _ = self.run_command(
                f"kubectl logs -n {self.namespace} deployment/local-frontend --tail=100"
            )
            if success:
                error_count = output.lower().count('error') + output.lower().count('exception')
                if error_count < 3:
                    return True, f"No critical errors ({error_count} errors found)"
                return False, f"{error_count} errors in logs"
            return False, "Cannot retrieve logs"

        self.test("Frontend Error Logs", check_frontend_logs)

    def test_configuration(self):
        """Test configuration and secrets"""
        # Test 12: Secrets exist
        def check_secrets():
            secrets = ['frontend-secrets', 'backend-secrets', 'postgres-secrets']
            missing = []
            for secret in secrets:
                success, _, _ = self.run_command(f"kubectl get secret {secret} -n {self.namespace}")
                if not success:
                    missing.append(secret)

            if not missing:
                return True, f"All {len(secrets)} secrets configured"
            return False, f"Missing secrets: {', '.join(missing)}"

        self.test("Secret Configuration", check_secrets)

        # Test 13: ConfigMaps exist
        def check_configmaps():
            success, output, _ = self.run_command(
                f"kubectl get configmaps -n {self.namespace} -o json"
            )
            if success:
                try:
                    cm = json.loads(output)
                    count = len(cm['items'])
                    if count >= 2:
                        return True, f"{count} ConfigMaps found"
                    return False, f"Expected at least 2 ConfigMaps, found {count}"
                except:
                    return False, "Cannot parse ConfigMaps"
            return False, "Cannot retrieve ConfigMaps"

        self.test("ConfigMap Configuration", check_configmaps)

        # Test 14: Resource limits
        def check_resources():
            success, output, _ = self.run_command(
                f"kubectl get deployments -n {self.namespace} -o json"
            )
            if success:
                try:
                    deployments = json.loads(output)
                    missing_limits = []
                    for deploy in deployments['items']:
                        name = deploy['metadata']['name']
                        containers = deploy['spec']['template']['spec']['containers']
                        if not any('limits' in c.get('resources', {}) for c in containers):
                            missing_limits.append(name)

                    if not missing_limits:
                        return True, "All deployments have resource limits"
                    return False, f"Missing limits: {', '.join(missing_limits)}"
                except:
                    return False, "Cannot parse deployment resources"
            return False, "Cannot retrieve deployments"

        self.test("Resource Limits", check_resources)

    def test_production_readiness(self):
        """Test production readiness criteria"""
        # Test 15: Persistent volumes
        def check_pvcs():
            success, output, _ = self.run_command(
                f"kubectl get pvc -n {self.namespace} -o json"
            )
            if success:
                try:
                    pvcs = json.loads(output)
                    total = len(pvcs['items'])
                    bound = sum(1 for pvc in pvcs['items'] if pvc['status']['phase'] == 'Bound')

                    if total >= 2 and bound == total:
                        return True, f"All {total} PVCs bound"
                    elif total >= 2:
                        return False, f"Only {bound}/{total} PVCs bound"
                    return False, f"Expected at least 2 PVCs, found {total}"
                except:
                    return False, "Cannot parse PVC status"
            return False, "Cannot retrieve PVCs"

        self.test("Persistent Storage", check_pvcs)

        # Test 16: Pod restart counts
        def check_restarts():
            success, output, _ = self.run_command(
                f"kubectl get pods -n {self.namespace} -o json"
            )
            if success:
                try:
                    pods = json.loads(output)
                    max_restarts = 0
                    for pod in pods['items']:
                        for status in pod['status'].get('containerStatuses', []):
                            max_restarts = max(max_restarts, status.get('restartCount', 0))

                    if max_restarts <= 2:
                        return True, f"Max restart count: {max_restarts}"
                    return False, f"High restart count detected: {max_restarts} restarts"
                except:
                    return False, "Cannot parse pod restart counts"
            return False, "Cannot retrieve pod status"

        self.test("Pod Stability", check_restarts)

        # Test 17: Overall health
        def check_overall():
            success, output, _ = self.run_command(
                f"kubectl get pods -n {self.namespace} -o json"
            )
            if success:
                try:
                    pods = json.loads(output)
                    total = len(pods['items'])
                    ready = sum(1 for pod in pods['items']
                               if all(c['ready'] for c in pod['status'].get('containerStatuses', [])))

                    if total == ready and self.failed == 0:
                        return True, "All systems operational"
                    elif total == ready:
                        return True, f"All pods ready but {self.failed} test(s) failed"
                    return False, f"Only {ready}/{total} pods ready"
                except:
                    return False, "Cannot parse overall status"
            return False, "Cannot verify cluster health"

        self.test("Overall Cluster Health", check_overall)

    def generate_report(self):
        """Generate test report"""
        total = self.passed + self.failed
        success_rate = (self.passed * 100 // total) if total > 0 else 0

        # Add summary to report
        self.report_lines.extend([
            "",
            "---",
            "",
            "## Summary",
            "",
            f"- **Total Tests**: {total}",
            f"- **Passed**: {self.passed}",
            f"- **Failed**: {self.failed}",
            f"- **Success Rate**: {success_rate}%",
            ""
        ])

        if self.failed == 0:
            self.report_lines.extend([
                "## ✅ Verdict: PRODUCTION READY",
                "",
                "All tests passed. The application is ready for production deployment.",
                ""
            ])
        else:
            self.report_lines.extend([
                "## ⚠️ Verdict: NOT PRODUCTION READY",
                "",
                f"**{self.failed} test(s) failed.** Please fix the issues before deploying to production.",
                ""
            ])

        self.report_lines.extend([
            "---",
            "",
            f"**Generated**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            ""
        ])

        # Save report
        report_file = f"claudedocs/e2e-test-report-{datetime.now().strftime('%Y%m%d-%H%M%S')}.md"
        Path(report_file).write_text('\n'.join(self.report_lines))

        # Display summary
        print()
        print(f"{Colors.BLUE}╔════════════════════════════════════════════════════════╗{Colors.NC}")
        print(f"{Colors.BLUE}║                    Test Summary                        ║{Colors.NC}")
        print(f"{Colors.BLUE}╚════════════════════════════════════════════════════════╝{Colors.NC}")
        print()
        print(f"  Total Tests:    {total}")
        print(f"  {Colors.GREEN}Passed:         {self.passed}{Colors.NC}")
        if self.failed > 0:
            print(f"  {Colors.RED}Failed:         {self.failed}{Colors.NC}")
        else:
            print(f"  Failed:         {self.failed}")
        print(f"  Success Rate:   {success_rate}%")
        print()

        if self.failed == 0:
            print(f"{Colors.GREEN}╔════════════════════════════════════════════════════════╗{Colors.NC}")
            print(f"{Colors.GREEN}║          ✅ ALL TESTS PASSED - PRODUCTION READY        ║{Colors.NC}")
            print(f"{Colors.GREEN}╚════════════════════════════════════════════════════════╝{Colors.NC}")
            print()
            print(f"{Colors.GREEN}The application has passed all validation tests and is ready{Colors.NC}")
            print(f"{Colors.GREEN}for production deployment.{Colors.NC}")
        else:
            print(f"{Colors.RED}╔════════════════════════════════════════════════════════╗{Colors.NC}")
            print(f"{Colors.RED}║       ⚠️  TESTS FAILED - NOT PRODUCTION READY          ║{Colors.NC}")
            print(f"{Colors.RED}╚════════════════════════════════════════════════════════╝{Colors.NC}")
            print()
            print(f"{Colors.RED}Please fix the {self.failed} failed test(s) before deploying{Colors.NC}")
            print(f"{Colors.RED}to production.{Colors.NC}")

        print()
        print(f"📄 Full report saved to: {Colors.BLUE}{report_file}{Colors.NC}")
        print()

        sys.exit(0 if self.failed == 0 else 1)

if __name__ == "__main__":
    suite = E2ETestSuite()
    suite.run_all_tests()
