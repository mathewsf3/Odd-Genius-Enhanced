# FootyStats API Deployment Checklist

## 🚀 Pre-Deployment Verification

### **1. API Account Verification**

- [ ] Verify FootyStats API key is active: `4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756`
- [ ] Confirm subscription status on FootyStats dashboard
- [ ] Select desired leagues in account settings
- [ ] Test basic API connectivity

### **2. Backend Service Verification**

- [ ] All FootyStats endpoints responding correctly
- [ ] Rate limiting working properly (150ms between requests)
- [ ] Caching system functioning
- [ ] Error handling and retry logic operational
- [ ] Data transformation producing consistent output

### **3. Controller Testing**

- [ ] `matchesController.js` methods working:
  - [ ] `getLiveMatches()`
  - [ ] `getUpcomingMatches()`
  - [ ] `getMatchDetails()`
  - [ ] `getMatchById()`
  - [ ] `getLeagueMatches()`
  - [ ] `getLiveLeagues()`
  - [ ] `clearCache()`

### **4. Frontend Integration**

- [ ] React frontend config updated
- [ ] Next.js frontend config updated
- [ ] League services pointing to FootyStats
- [ ] All API calls returning expected data structure

### **5. Legacy Service Cleanup**

- [ ] Confirm old API Football service throws deprecation errors
- [ ] Verify removed services are not being called:
  - [ ] `cardStatsService.js` (removed)
  - [ ] `enhanced-match-analysis.js` (removed)
  - [ ] `MappingNew.js` (removed)
  - [ ] `teamMappingService.js` (removed)
  - [ ] `universalTeamDiscovery.js` (removed)

## 🔧 Deployment Commands

### **Backend Start**

```bash
cd backend
npm install
npm start
```

### **Frontend Start (React)**

```bash
cd frontend
npm install
npm start
```

### **Frontend Start (Next.js)**

```bash
cd frontend-nextjs
npm install
npm run dev
```

## 🎯 Post-Deployment Monitoring

### **1. API Performance**

- [ ] Monitor response times (< 2 seconds target)
- [ ] Track error rates (< 5% target)
- [ ] Verify cache hit rates
- [ ] Check API rate limit compliance

### **2. Data Quality**

- [ ] Verify match data accuracy
- [ ] Check statistics completeness
- [ ] Confirm odds data availability
- [ ] Validate H2H information

### **3. User Experience**

- [ ] Frontend loading times acceptable
- [ ] No broken API calls
- [ ] All match information displaying correctly
- [ ] Search and filtering working

## 🚨 Troubleshooting

### **Common Issues**

**API 500 Errors:**

- Check FootyStats account status
- Verify API key is correct
- Ensure selected leagues in dashboard
- Check subscription is active

**No Data Returned:**

- Verify leagues are selected in FootyStats account
- Check date ranges (some endpoints require specific dates)
- Confirm season IDs are valid

**Rate Limiting:**

- Verify 150ms delay between requests
- Check retry logic is working
- Monitor request frequency

**Cache Issues:**

- Use `clearCache()` method to reset
- Check cache TTL settings
- Verify cache keys are unique

## 📞 Support

**FootyStats API Support:**

- Documentation: https://footystats.org/api/documentations/
- Support: Contact FootyStats support team
- Account: Check FootyStats dashboard

**Development Issues:**

- Check logs in `/backend/logs/`
- Use `test-footystats-basic.js` for connectivity testing
- Run `verify-footystats-complete.js` for endpoint testing

---

**✅ Once all items are checked, the FootyStats API refactoring is fully deployed and operational!**
