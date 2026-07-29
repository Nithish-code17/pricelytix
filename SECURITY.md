# Security Policy

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability.

Use GitHub's private vulnerability reporting feature for this repository:

1. Open the repository's **Security** tab.
2. Select **Advisories**.
3. Choose **Report a vulnerability**.
4. Include the affected component, reproduction steps, impact, and any suggested mitigation.

If private vulnerability reporting is unavailable, contact the repository owner through the contact method listed on the owner's GitHub profile and request a private channel. Do not include exploit details or credentials in the initial public message.

Reports should include, when possible:

- A clear description of the issue and its impact
- Affected routes, versions, or commits
- Minimal reproduction steps or a proof of concept
- Required configuration and environment details
- Suggested fixes or mitigations

Please allow reasonable time for acknowledgement, investigation, and remediation before disclosure. Do not access data that is not yours, degrade service, send unsolicited traffic, or retain sensitive information discovered during testing.

## Supported versions

Pricelytix is under active development. Security fixes are applied to the latest code on `main`; older commits and deployments are not separately supported.

## Sensitive configuration

Never commit database URLs, JWT secrets, SMTP credentials, AI API keys, cron secrets, session cookies, or production data. If a secret is exposed, revoke or rotate it immediately before removing it from Git history.
