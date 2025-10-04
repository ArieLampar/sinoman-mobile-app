# Backup Strategy for Sinoman Mobile App

## Overview
This document outlines the backup, disaster recovery, and data protection strategies for the Sinoman Mobile App's financial data stored in Supabase.

## 1. Supabase Automatic Backups

### Daily Backups
- **Frequency**: Daily automated backups
- **Retention**: 7 days for Free tier, 30 days for Pro tier
- **Backup Type**: Full database snapshots
- **Storage Location**: Supabase managed storage (AWS S3)
- **Coverage**: All PostgreSQL data including:
  - User profiles
  - Transactions
  - Balances (user_balances, savings_balance)
  - Merchants
  - OTP requests

### Point-in-Time Recovery (PITR)
- **Availability**: Pro tier and above
- **Window**: Up to 7 days (Pro), 14 days (Team), 30 days (Enterprise)
- **Granularity**: Second-level precision
- **Use Case**: Recover from accidental deletions or data corruption

## 2. Manual Backup Procedures

### Weekly Manual Exports
Perform weekly manual database exports as an additional safety layer:

```bash
# Using Supabase CLI
supabase db dump -f backups/sinoman_backup_$(date +%Y%m%d).sql

# Or using pg_dump directly
pg_dump -h db.your-project.supabase.co \
  -U postgres \
  -d postgres \
  --clean --if-exists \
  > sinoman_backup_$(date +%Y%m%d).sql
```

### Backup Storage
- **Primary**: Encrypted cloud storage (AWS S3, Google Cloud Storage)
- **Secondary**: Local secure storage (encrypted)
- **Retention**: 90 days minimum
- **Encryption**: AES-256 encryption at rest

## 3. Critical Data Protection

### Financial Tables (High Priority)
The following tables require special protection:

1. **transactions**
   - Contains all financial transaction records
   - Never delete, only mark as cancelled/failed
   - Audit trail required

2. **user_balances**
   - Real-time balance tracking
   - Protected by Row Level Security (RLS)
   - Atomic updates only via stored procedures

3. **savings_balance**
   - Savings account balances
   - Protected by RLS
   - Versioning recommended

### Data Integrity Measures
- **Foreign Key Constraints**: Prevent orphaned records
- **Check Constraints**: Ensure data validity (e.g., balance >= 0)
- **Triggers**: Audit logging for critical updates
- **Transaction Isolation**: SERIALIZABLE for financial operations

## 4. Disaster Recovery Plan

### Recovery Time Objective (RTO)
- **Target**: < 4 hours for full recovery
- **Critical Services**: < 30 minutes

### Recovery Point Objective (RPO)
- **Target**: < 1 hour of data loss maximum
- **Financial Transactions**: < 5 minutes (via replication)

### Recovery Procedures

#### Scenario 1: Accidental Data Deletion
1. Identify the timestamp of deletion
2. Use Point-in-Time Recovery (PITR) if available
3. If PITR not available, restore from latest daily backup
4. Verify data integrity
5. Test critical flows (login, payments, balances)
6. Restore to production

#### Scenario 2: Database Corruption
1. Identify scope of corruption
2. Restore from latest known-good backup
3. Apply transaction logs since backup
4. Run data integrity checks:
   ```sql
   -- Check balance consistency
   SELECT user_id,
          (SELECT SUM(amount) FROM transactions WHERE user_id = ub.user_id AND status = 'completed') as transaction_total,
          available_balance
   FROM user_balances ub;
   ```
5. Reconcile discrepancies
6. Resume operations

#### Scenario 3: Complete Database Loss
1. Provision new Supabase project
2. Restore from latest encrypted backup
3. Update connection strings in app configuration
4. Deploy updated configuration via EAS Update
5. Verify all services operational
6. Monitor for errors

### DR Testing Schedule
- **Quarterly**: Test restore from backup
- **Bi-annually**: Full DR simulation
- **Annually**: Multi-region failover test (if applicable)

## 5. Monitoring and Alerts

### Backup Health Monitoring
```sql
-- Create monitoring view for backup health
CREATE OR REPLACE VIEW backup_health AS
SELECT
  'transactions' as table_name,
  COUNT(*) as row_count,
  MAX(created_at) as latest_record,
  NOW() - MAX(created_at) as time_since_last_update
FROM transactions
UNION ALL
SELECT
  'user_balances',
  COUNT(*),
  MAX(updated_at),
  NOW() - MAX(updated_at)
FROM user_balances;
```

### Alerts
Set up alerts for:
- Backup failures
- Unusual transaction volumes
- Balance inconsistencies
- Replication lag (if using read replicas)

## 6. Compliance and Audit

### Audit Logging
Enable audit logging for all financial operations:

```sql
-- Audit log table
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  user_id UUID,
  old_data JSONB,
  new_data JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (table_name, operation, user_id, old_data, new_data)
    VALUES (TG_TABLE_NAME, TG_OP, NEW.user_id, row_to_json(OLD), row_to_json(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (table_name, operation, user_id, old_data)
    VALUES (TG_TABLE_NAME, TG_OP, OLD.user_id, row_to_json(OLD));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to financial tables
CREATE TRIGGER audit_user_balances
AFTER UPDATE OR DELETE ON user_balances
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_transactions
AFTER UPDATE OR DELETE ON transactions
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

### Retention Policy
- **Transaction Records**: 7 years (financial compliance)
- **Audit Logs**: 3 years
- **Backups**: 90 days
- **User Data**: Active + 2 years after account closure

## 7. Security

### Backup Encryption
- All backups encrypted with AES-256
- Encryption keys stored in secure vault (AWS KMS, Google Secret Manager)
- Regular key rotation (every 90 days)

### Access Control
- Backup access restricted to:
  - Database administrators
  - Authorized DevOps personnel
- Requires multi-factor authentication
- All access logged and monitored

### Backup Integrity
- SHA-256 checksums for all backups
- Verify integrity before restore
- Store checksums separately from backups

## 8. Responsibilities

| Role | Responsibility |
|------|----------------|
| DevOps Team | Daily backup verification, DR testing |
| Database Admin | Backup restoration, integrity checks |
| Development Team | Schema migrations, data validation |
| Security Team | Access control, encryption key management |
| Compliance Team | Audit log review, retention policy enforcement |

## 9. Emergency Contacts

```
Database Admin: [CONTACT INFO]
DevOps Lead: [CONTACT INFO]
Supabase Support: support@supabase.com (Pro+ tier)
Emergency Hotline: [PHONE NUMBER]
```

## 10. Backup Checklist

### Daily
- [ ] Verify automatic backup completed
- [ ] Check backup size and record count
- [ ] Monitor for backup failures

### Weekly
- [ ] Export manual backup
- [ ] Upload to encrypted cloud storage
- [ ] Verify backup integrity (checksum)

### Monthly
- [ ] Test restore from backup (non-production environment)
- [ ] Review and clean old backups
- [ ] Update documentation if procedures changed

### Quarterly
- [ ] Full DR simulation
- [ ] Review and update emergency contacts
- [ ] Audit access logs
- [ ] Key rotation

---

**Document Version**: 1.0
**Last Updated**: 2025-01-28
**Next Review Date**: 2025-04-28
