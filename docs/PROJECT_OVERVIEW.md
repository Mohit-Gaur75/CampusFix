# PHASE 0 — PRODUCT UNDERSTANDING

## 0.1 Problem

Campus issues (broken lights, Wi-Fi, leaks, hostel maintenance, sanitation) are reported through WhatsApp, calls and verbal messages. There is no single place where an issue is recorded, owned, prioritized and tracked to resolution.

## 0.2 Target users

| User | Needs |
| --- | --- |
| Student | Report fast (under 60 seconds), know it was received, see progress |
| Authority (estate office / maintenance supervisor) | One queue, clear urgency, assign work, close the loop |
| Admin (optional) | Maintain departments, locations, users — handled by seed data in MVP |

## 0.3 Current pain points → how CampusFix answers them

| # | Pain point (from problem statement) | CampusFix answer |
| --- | --- | --- |
| 1 | Students don't know where/whom to report | One form; category + department auto-suggested |
| 2 | Complaints get lost in chats | Every report becomes a record with an ID (`CF-0042`) |
| 3 | No status tracking | Status + timeline + in-app notifications |
| 4 | No central admin view | Authority dashboard = control center |
| 5 | Same problem reported repeatedly | Duplicate detection at submission + grouping under one **Issue** |
| 6 | Hard to know what's urgent | Deterministic, explainable priority score |
| 7 | No visibility on recurring problems | Analytics: hotspots, recurring locations, aging issues |

## 0.4 Proposed solution

A web platform where a student files a **Report** (location + category + description + photo). The system checks whether an open **Issue** already covers it. If yes, the student can attach their report to it ("+1, I'm affected too"); if not, a new Issue is created. Priority is computed automatically and rises as more students are affected or time passes. Authorities work on **Issues**, not on raw messages.

## 0.5 Core value proposition

> "Instead of 40 WhatsApp messages about the same broken light, the campus gets **one** tracked issue with a clear owner, priority, and status."

## 0.6 The single most important design decision: Issue vs Report

- **Report** = one student's submission (who, when, their photo/description).
- **Issue** = the underlying real-world problem (one broken light) that many reports can point to.
- Authorities manage Issues. Students see Issues they reported/joined. Priority is computed on the Issue using the number of linked reports.

## 0.7 What should NOT be built in the MVP

- Microservices, message queues, Redis, websockets (use polling/refetch)
- Paid AI APIs or image classification (keyword rules only)
- Email/SMS/push notifications (in-app only; email is an optional wow)
- Complex RBAC/permissions UI, multi-campus tenancy
- Staff mobile app, SLA contracts, billing/inventory
- Full admin CRUD screens (seed departments/locations; admin = optional)
- Chat between student and authority (remarks + timeline are enough)

---
