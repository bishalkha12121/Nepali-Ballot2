#!/usr/bin/env python3
"""
Nepal Election Platform Backend API Testing
Tests all API endpoints for the voting platform
"""

import requests
import sys
import json
from datetime import datetime
import uuid

class NepalElectionAPITester:
    def __init__(self, base_url="https://nepali-ballot.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.voter_token = f"test_voter_{uuid.uuid4().hex[:8]}"
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Message: {data.get('message', 'No message')}"
            self.log_test("API Root", success, details)
            return success
        except Exception as e:
            self.log_test("API Root", False, str(e))
            return False

    def test_get_candidates(self):
        """Test GET /api/candidates"""
        try:
            response = requests.get(f"{self.api_url}/candidates", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                candidates = response.json()
                if isinstance(candidates, list) and len(candidates) == 5:
                    # Check if all expected candidates are present
                    expected_names = ["Balen Shah", "KP Sharma Oli", "Sher Bahadur Deuba", 
                                    "Pushpa Kamal Dahal (Prachanda)", "Rabi Lamichhane"]
                    actual_names = [c.get('name') for c in candidates]
                    
                    if all(name in actual_names for name in expected_names):
                        details += f", Found {len(candidates)} candidates with all expected names"
                        self.candidates = candidates  # Store for later tests
                    else:
                        success = False
                        details += f", Missing expected candidates. Found: {actual_names}"
                else:
                    success = False
                    details += f", Expected 5 candidates, got {len(candidates) if isinstance(candidates, list) else 'non-list'}"
            
            self.log_test("GET Candidates", success, details)
            return success
        except Exception as e:
            self.log_test("GET Candidates", False, str(e))
            return False

    def test_get_single_candidate(self):
        """Test GET /api/candidates/{id}"""
        if not hasattr(self, 'candidates') or not self.candidates:
            self.log_test("GET Single Candidate", False, "No candidates available from previous test")
            return False
        
        try:
            candidate_id = self.candidates[0]['id']  # Use first candidate
            response = requests.get(f"{self.api_url}/candidates/{candidate_id}", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                candidate = response.json()
                required_fields = ['id', 'name', 'party', 'party_symbol', 'party_color', 'image_url', 'bio', 'slogan']
                missing_fields = [field for field in required_fields if field not in candidate]
                
                if not missing_fields:
                    details += f", All required fields present for {candidate.get('name')}"
                else:
                    success = False
                    details += f", Missing fields: {missing_fields}"
            
            self.log_test("GET Single Candidate", success, details)
            return success
        except Exception as e:
            self.log_test("GET Single Candidate", False, str(e))
            return False

    def test_cast_vote(self):
        """Test POST /api/vote"""
        if not hasattr(self, 'candidates') or not self.candidates:
            self.log_test("Cast Vote", False, "No candidates available from previous test")
            return False
        
        try:
            candidate_id = self.candidates[0]['id']  # Vote for first candidate
            vote_data = {
                "candidate_id": candidate_id,
                "voter_token": self.voter_token
            }
            
            response = requests.post(f"{self.api_url}/vote", json=vote_data, timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                result = response.json()
                if result.get('success') and 'message' in result:
                    details += f", Vote cast successfully: {result['message']}"
                    self.voted_candidate_id = candidate_id
                else:
                    success = False
                    details += f", Unexpected response format: {result}"
            
            self.log_test("Cast Vote", success, details)
            return success
        except Exception as e:
            self.log_test("Cast Vote", False, str(e))
            return False

    def test_duplicate_vote_prevention(self):
        """Test that duplicate votes are prevented"""
        if not hasattr(self, 'voted_candidate_id'):
            self.log_test("Duplicate Vote Prevention", False, "No previous vote to test against")
            return False
        
        try:
            # Try to vote again with same token
            vote_data = {
                "candidate_id": self.voted_candidate_id,
                "voter_token": self.voter_token
            }
            
            response = requests.post(f"{self.api_url}/vote", json=vote_data, timeout=10)
            # Should return 400 for duplicate vote
            success = response.status_code == 400
            details = f"Status: {response.status_code}"
            
            if success:
                result = response.json()
                if 'already voted' in result.get('detail', '').lower():
                    details += ", Correctly prevented duplicate vote"
                else:
                    success = False
                    details += f", Wrong error message: {result.get('detail')}"
            else:
                details += ", Should have returned 400 for duplicate vote"
            
            self.log_test("Duplicate Vote Prevention", success, details)
            return success
        except Exception as e:
            self.log_test("Duplicate Vote Prevention", False, str(e))
            return False

    def test_check_vote_status(self):
        """Test GET /api/check-vote/{token}"""
        try:
            response = requests.get(f"{self.api_url}/check-vote/{self.voter_token}", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                result = response.json()
                if result.get('has_voted') and result.get('candidate_id') == getattr(self, 'voted_candidate_id', None):
                    details += f", Correctly shows voted for {result['candidate_id']}"
                else:
                    success = False
                    details += f", Incorrect vote status: {result}"
            
            self.log_test("Check Vote Status", success, details)
            return success
        except Exception as e:
            self.log_test("Check Vote Status", False, str(e))
            return False

    def test_get_results(self):
        """Test GET /api/results"""
        try:
            response = requests.get(f"{self.api_url}/results", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                results = response.json()
                required_fields = ['total_votes', 'results', 'last_updated']
                missing_fields = [field for field in required_fields if field not in results]
                
                if not missing_fields:
                    total_votes = results['total_votes']
                    results_list = results['results']
                    
                    if isinstance(results_list, list) and len(results_list) == 5:
                        # Check if results have required fields
                        result_fields = ['candidate_id', 'candidate_name', 'party', 'party_color', 'vote_count', 'percentage']
                        first_result = results_list[0] if results_list else {}
                        missing_result_fields = [field for field in result_fields if field not in first_result]
                        
                        if not missing_result_fields:
                            details += f", Total votes: {total_votes}, Results for {len(results_list)} candidates"
                        else:
                            success = False
                            details += f", Missing result fields: {missing_result_fields}"
                    else:
                        success = False
                        details += f", Expected 5 results, got {len(results_list) if isinstance(results_list, list) else 'non-list'}"
                else:
                    success = False
                    details += f", Missing fields: {missing_fields}"
            
            self.log_test("GET Results", success, details)
            return success
        except Exception as e:
            self.log_test("GET Results", False, str(e))
            return False

    def test_get_historical_data(self):
        """Test GET /api/historical"""
        try:
            response = requests.get(f"{self.api_url}/historical", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                historical = response.json()
                if isinstance(historical, list) and len(historical) >= 2:
                    # Check if we have expected elections (2017, 2022)
                    years = [election.get('year') for election in historical]
                    if 2017 in years and 2022 in years:
                        details += f", Found {len(historical)} historical elections including 2017 and 2022"
                        
                        # Check structure of first election
                        first_election = historical[0]
                        required_fields = ['id', 'year', 'election_type', 'results', 'total_voters', 'turnout_percentage']
                        missing_fields = [field for field in required_fields if field not in first_election]
                        
                        if missing_fields:
                            success = False
                            details += f", Missing election fields: {missing_fields}"
                    else:
                        success = False
                        details += f", Missing expected years. Found years: {years}"
                else:
                    success = False
                    details += f", Expected at least 2 elections, got {len(historical) if isinstance(historical, list) else 'non-list'}"
            
            self.log_test("GET Historical Data", success, details)
            return success
        except Exception as e:
            self.log_test("GET Historical Data", False, str(e))
            return False

    def test_get_stats(self):
        """Test GET /api/stats"""
        try:
            response = requests.get(f"{self.api_url}/stats", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                stats = response.json()
                required_fields = ['total_votes', 'total_candidates', 'election_status']
                missing_fields = [field for field in required_fields if field not in stats]
                
                if not missing_fields:
                    details += f", Total votes: {stats['total_votes']}, Candidates: {stats['total_candidates']}, Status: {stats['election_status']}"
                else:
                    success = False
                    details += f", Missing fields: {missing_fields}"
            
            self.log_test("GET Stats", success, details)
            return success
        except Exception as e:
            self.log_test("GET Stats", False, str(e))
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print(f"🚀 Starting Nepal Election API Tests")
        print(f"📍 Base URL: {self.base_url}")
        print(f"🔗 API URL: {self.api_url}")
        print(f"🎫 Voter Token: {self.voter_token}")
        print("=" * 60)
        
        # Test basic connectivity first
        if not self.test_api_root():
            print("❌ API root test failed - stopping tests")
            return False
        
        # Test candidate endpoints
        self.test_get_candidates()
        self.test_get_single_candidate()
        
        # Test voting functionality
        self.test_cast_vote()
        self.test_duplicate_vote_prevention()
        self.test_check_vote_status()
        
        # Test results and data endpoints
        self.test_get_results()
        self.test_get_historical_data()
        self.test_get_stats()
        
        # Print summary
        print("=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return False

def main():
    """Main test runner"""
    tester = NepalElectionAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    results = {
        "timestamp": datetime.now().isoformat(),
        "total_tests": tester.tests_run,
        "passed_tests": tester.tests_passed,
        "success_rate": (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0,
        "test_details": tester.test_results
    }
    
    with open("/app/backend_test_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📄 Detailed results saved to: /app/backend_test_results.json")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())