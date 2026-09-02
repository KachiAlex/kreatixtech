-- D1 Export for VPS import
-- Generated: 2026-09-02 15:23:33

-- Table: users (3 rows)
DELETE FROM users;
INSERT INTO users (id, email, display_name, password_hash, password_salt, role, is_active, avatar_url, storage_quota, storage_used, created_at, last_login_at) VALUES (1, 'akoma@kreatixtech.com', 'Akoma', 'tq41NEl+eZgjK+p3JvwGv38y1QA6JhUSzOPCh1PFK9o=', 'mR49RKNjEw7f33EbNC/P7g==', 'admin', 1, NULL, 5368709120, 0, '2026-09-01 19:09:12', '2026-09-02 11:15:13');
INSERT INTO users (id, email, display_name, password_hash, password_salt, role, is_active, avatar_url, storage_quota, storage_used, created_at, last_login_at) VALUES (2, 'info@kreatixtech.com', 'Kreatix Administrator', 'mD/2H63qZbkvv79fkHiRBu0GTfbT1GXlQoPLHxX2aY4=', '9JmrE6B24zlzi+25rJqN+Q==', 'user', 1, NULL, 5368709120, 0, '2026-09-02 09:30:28', NULL);
INSERT INTO users (id, email, display_name, password_hash, password_salt, role, is_active, avatar_url, storage_quota, storage_used, created_at, last_login_at) VALUES (3, 'support@kreatixtech.com', 'Kreatix Support', 'o/RSbOFMruv5BeVSsEszNFnarSDS16l/I7LwnYLYMNU=', 'H51r/QMimmUiZ/Ve8m7TNQ==', 'user', 1, NULL, 5368709120, 0, '2026-09-02 09:31:09', NULL);

-- Table: sessions (7 rows)
DELETE FROM sessions;
INSERT INTO sessions (id, user_id, token_hash, device_info, ip_address, expires_at, created_at) VALUES ('464cfa28ef2a40c1329b1f071302e273', 1, 'DKhSvY2xhSAUA0atc5Ibaj-AXx36ZFOSQPF_aDrP6ms', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9278', '102.88.169.209', '2026-10-01 19:10:26', '2026-09-01 19:10:26');
INSERT INTO sessions (id, user_id, token_hash, device_info, ip_address, expires_at, created_at) VALUES ('005c28e3439cd33fc72dd9da7d4db82c', 1, 'eBWc-pw5jL_2zLfTEqfz0CQAZ_iPv_QNMPCIeaEZERE', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9278', '102.88.169.209', '2026-10-01 19:10:32', '2026-09-01 19:10:32');
INSERT INTO sessions (id, user_id, token_hash, device_info, ip_address, expires_at, created_at) VALUES ('80ad68d8cffe16a40babb6d306a13826', 1, 'klQ59l2710AUAiHQmprbg5cS2yd4lUxIYAjE9WGRDLY', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0', '102.88.169.209', '2026-10-01 19:11:10', '2026-09-01 19:11:10');
INSERT INTO sessions (id, user_id, token_hash, device_info, ip_address, expires_at, created_at) VALUES ('82b6f6a277c6be1f54fdca4f7d928fa1', 1, 'xCG66RW5mabPmUwOCz47_jGIXbuTjO2Rfh0eETi0e-U', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0', '102.88.168.102', '2026-10-02 03:27:18', '2026-09-02 03:27:18');
INSERT INTO sessions (id, user_id, token_hash, device_info, ip_address, expires_at, created_at) VALUES ('05bac2777d7ee748baa21d955ee3b343', 1, 'MdHDQNks5_XdNuoP1rDWDPkaK__Ei9uSb6ii77_AQl4', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36', '102.88.168.102', '2026-10-02 07:00:35', '2026-09-02 07:00:35');
INSERT INTO sessions (id, user_id, token_hash, device_info, ip_address, expires_at, created_at) VALUES ('b987e25036e791b474db09ca5ac29c90', 1, '4vrksoeKt-F9Fgl0XBY7YjSiKsbWviiyZ6OO8vMEFOs', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0', '197.210.71.189', '2026-10-02 11:11:24', '2026-09-02 11:11:24');
INSERT INTO sessions (id, user_id, token_hash, device_info, ip_address, expires_at, created_at) VALUES ('9dd65d70d471b3122d42062bf06cd587', 1, 'wA3nvUOXEswtk5LDJcooOSu891M2dctoSnQDcKaqnC4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0', '197.210.71.189', '2026-10-02 11:15:13', '2026-09-02 11:15:13');

-- Table: folders (21 rows)
DELETE FROM folders;
INSERT INTO folders (id, user_id, name, type, icon, color, sort_order, unread_count, total_count, created_at) VALUES (1, 1, 'Inbox', 'inbox', 'inbox', '#1a73e8', 0, 1, 4, '2026-09-01 19:09:22');
INSERT INTO folders (id, user_id, name, type, icon, color, sort_order, unread_count, total_count, created_at) VALUES (2, 1, 'Starred', 'starred', 'star', '#fbbc04', 1, 0, 0, '2026-09-01 19:09:22');
INSERT INTO folders (id, user_id, name, type, icon, color, sort_order, unread_count, total_count, created_at) VALUES (3, 1, 'Sent', 'sent', 'send', '#1a73e8', 2, 0, 6, '2026-09-01 19:09:22');
INSERT INTO folders (id, user_id, name, type, icon, color, sort_order, unread_count, total_count, created_at) VALUES (4, 1, 'Drafts', 'drafts', 'draft', '#5f6368', 3, 0, 0, '2026-09-01 19:09:22');
INSERT INTO folders (id, user_id, name, type, icon, color, sort_order, unread_count, total_count, created_at) VALUES (5, 1, 'Archive', 'archive', 'archive', '#5f6368', 4, 0, 0, '2026-09-01 19:09:22');
INSERT INTO folders (id, user_id, name, type, icon, color, sort_order, unread_count, total_count, created_at) VALUES (6, 1, 'Spam', 'spam', 'spam', '#d93025', 5, 0, 0, '2026-09-01 19:09:22');
INSERT INTO folders (id, user_id, name, type, icon, color, sort_order, unread_count, total_count, created_at) VALUES (7, 1, 'Trash', 'trash', 'trash', '#5f6368', 6, 0, 0, '2026-09-01 19:09:22');
INSERT INTO folders (id, user_id, name, type, icon, color, sort_order, unread_count, total_count, created_at) VALUES (8, 2, 'Inbox', 'inbox', 'inbox', '#1a73e8', 0, 0, 0, '2026-09-02 09:30:28');
INSERT INTO folders (id, user_id, name, type, icon, color, sort_order, unread_count, total_count, created_at) VALUES (9, 2, 'Starred', 'starred', 'star', '#fbbc04', 1, 0, 0, '2026-09-02 09:30:29');
INSERT INTO folders (id, user_id, name, type, icon, color, sort_order, unread_count, total_count, created_at) VALUES (10, 2, 'Sent', 'sent', 'send', '#1a73e8', 2, 0, 0, '2026-09-02 09:30:29');
INSERT INTO folders (id, user_id, name, type, icon, color, sort_order, unread_count, total_count, created_at) VALUES (11, 2, 'Drafts', 'drafts', 'draft', '#5f6368', 3, 0, 0, '2026-09-02 09:30:29');
INSERT INTO folders (id, user_id, name, type, icon, color, sort_order, unread_count, total_count, created_at) VALUES (12, 2, 'Archive', 'archive', 'archive', '#5f6368', 4, 0, 0, '2026-09-02 09:30:29');
INSERT INTO folders (id, user_id, name, type, icon, color, sort_order, unread_count, total_count, created_at) VALUES (13, 2, 'Spam', 'spam', 'spam', '#d93025', 5, 0, 0, '2026-09-02 09:30:29');
INSERT INTO folders (id, user_id, name, type, icon, color, sort_order, unread_count, total_count, created_at) VALUES (14, 2, 'Trash', 'trash', 'trash', '#5f6368', 6, 0, 0, '2026-09-02 09:30:30');
INSERT INTO folders (id, user_id, name, type, icon, color, sort_order, unread_count, total_count, created_at) VALUES (15, 3, 'Inbox', 'inbox', 'inbox', '#1a73e8', 0, 0, 0, '2026-09-02 09:31:09');
INSERT INTO folders (id, user_id, name, type, icon, color, sort_order, unread_count, total_count, created_at) VALUES (16, 3, 'Starred', 'starred', 'star', '#fbbc04', 1, 0, 0, '2026-09-02 09:31:09');
INSERT INTO folders (id, user_id, name, type, icon, color, sort_order, unread_count, total_count, created_at) VALUES (17, 3, 'Sent', 'sent', 'send', '#1a73e8', 2, 0, 0, '2026-09-02 09:31:09');
INSERT INTO folders (id, user_id, name, type, icon, color, sort_order, unread_count, total_count, created_at) VALUES (18, 3, 'Drafts', 'drafts', 'draft', '#5f6368', 3, 0, 0, '2026-09-02 09:31:10');
INSERT INTO folders (id, user_id, name, type, icon, color, sort_order, unread_count, total_count, created_at) VALUES (19, 3, 'Archive', 'archive', 'archive', '#5f6368', 4, 0, 0, '2026-09-02 09:31:10');
INSERT INTO folders (id, user_id, name, type, icon, color, sort_order, unread_count, total_count, created_at) VALUES (20, 3, 'Spam', 'spam', 'spam', '#d93025', 5, 0, 0, '2026-09-02 09:31:10');
INSERT INTO folders (id, user_id, name, type, icon, color, sort_order, unread_count, total_count, created_at) VALUES (21, 3, 'Trash', 'trash', 'trash', '#5f6368', 6, 0, 0, '2026-09-02 09:31:10');

-- Table: emails (10 rows)
DELETE FROM emails;
INSERT INTO emails (id, user_id, message_id, thread_id, in_reply_to, ref_header, from_address, from_name, to_address, cc_address, bcc_address, reply_to, subject, text, html, snippet, folder_id, is_read, is_starred, is_important, is_draft, has_attachments, size, direction, status, received_at, sent_at, created_at, updated_at, snooze_until) VALUES (1, 1, '30615dc6-324b-42b6-93d3-f1234f17f0c2', 'thread-test-akoma@kreatixtech.com', NULL, NULL, 'akoma@kreatixtech.com', 'Akoma', 'onyedika.akoma@gmail.com', NULL, NULL, NULL, 'Test', 'Test', 'Test', 'Test', 3, 1, 0, 0, 0, 0, 4, 'outbound', 'sent', '2026-09-02 02:34:39', '2026-09-02 02:34:39', '2026-09-02 02:34:39', '2026-09-02 02:34:39', NULL);
INSERT INTO emails (id, user_id, message_id, thread_id, in_reply_to, ref_header, from_address, from_name, to_address, cc_address, bcc_address, reply_to, subject, text, html, snippet, folder_id, is_read, is_starred, is_important, is_draft, has_attachments, size, direction, status, received_at, sent_at, created_at, updated_at, snooze_until) VALUES (2, 1, '<CAJ6i52o2fXXERY6_vBuY4oBa-Kr6f9PTCZ2ZgF3+EtufiWZj7w@mail.gmail.com>', 'thread-test-onyedika.akoma@gmail.com', NULL, NULL, 'onyedika.akoma@gmail.com', 'Onyedikachi Akoma', 'akoma@kreatixtech.com', NULL, NULL, NULL, 'Test', 'Test

', '<div dir="auto">Test</div>

', 'Test', 1, 1, 0, 0, 0, 0, 34, 'inbound', 'received', '2026-09-02 03:27:59', NULL, '2026-09-02 03:27:59', '2026-09-02 03:28:23', NULL);
INSERT INTO emails (id, user_id, message_id, thread_id, in_reply_to, ref_header, from_address, from_name, to_address, cc_address, bcc_address, reply_to, subject, text, html, snippet, folder_id, is_read, is_starred, is_important, is_draft, has_attachments, size, direction, status, received_at, sent_at, created_at, updated_at, snooze_until) VALUES (3, 1, '8e4d592a-f0b4-41d7-841b-5f93bc0c5e89', 'thread-test-akoma@kreatixtech.com', NULL, NULL, 'akoma@kreatixtech.com', 'Akoma', 'onyedika.akoma@gmail.com', NULL, NULL, NULL, 'Test', 'Test', 'Test', 'Test', 3, 1, 0, 0, 0, 0, 4, 'outbound', 'sent', '2026-09-02 03:28:55', '2026-09-02 03:28:55', '2026-09-02 03:28:55', '2026-09-02 03:28:55', NULL);
INSERT INTO emails (id, user_id, message_id, thread_id, in_reply_to, ref_header, from_address, from_name, to_address, cc_address, bcc_address, reply_to, subject, text, html, snippet, folder_id, is_read, is_starred, is_important, is_draft, has_attachments, size, direction, status, received_at, sent_at, created_at, updated_at, snooze_until) VALUES (4, 1, '<AM0PR08MB534753B0AA0F1C1D3EF1F735F4B72@AM0PR08MB5347.eurprd08.prod.outlook.com>', 'LO5P302MB2542C938F933495029B8D515AECA2@LO5P302MB2542.GBRP302.PROD.OUTLOOK.COM', '<AM0PR08MB53471EF3D908F35916336C71F4A92@AM0PR08MB5347.eurprd08.prod.outlook.com>', '<LO5P302MB2542C938F933495029B8D515AECA2@LO5P302MB2542.GBRP302.PROD.OUTLOOK.COM> <AM0PR08MB5347E85A3857BB5BF8D66637F4C92@AM0PR08MB5347.eurprd08.prod.outlook.com> <AM0PR08MB53473B3F26B8BF726F97E0E4F4A72@AM0PR08MB5347.eurprd08.prod.outlook.com> <AM0PR08MB53471BAD3F692890577EB139F4A92@AM0PR08MB5347.eurprd08.prod.outlook.com> <AS8PR08MB7944EE834D762FD0301DB63CF8A92@AS8PR08MB7944.eurprd08.prod.outlook.com> <AM0PR08MB53471EF3D908F35916336C71F4A92@AM0PR08MB5347.eurprd08.prod.outlook.com>', 'John.Moses@whytelabeltech.com', 'John Moses', 'akoma@kreatixtech.com', 'saheed.otusajo@canarypointholding.com,wisdom.ibanga@whytelabeltech.com,abayomi.olufemi@whytelabeltech.com,emmanuel.bassey@assetsmfb.com,office.md@assetsmfb.com,praise.sanusi@assetsmfb.com,yakubu.johntela@assetsmfb.com', NULL, NULL, 'Re: Vulnerability Assessment and Penetration Test (VAPT) - Vendor Engagement', 'Dear Okoma,

Top of the morning to you.

As disscused, kindly share an invoice that contains a means of mobilization payment.

Warm regards,
________________________________
From: John Moses <John.Moses@whytelabeltech.com>
Sent: Monday, August 31, 2026 6:52 PM
To: Emmanuel Bassey <emmanuel.bassey@assetsmfb.com>; Office of the MD <office.md@assetsmfb.com>; Praise Sanusi <praise.sanusi@assetsmfb.com>
Cc: Saheed Otusajo <saheed.otusajo@canarypointholding.com>; Wisdom Ibanga <wisdom.ibanga@whytelabeltech.com>; Abayomi Olufemi <abayomi.olufemi@whytelabeltech.com>
Subject: Re: Vulnerability Assessment and Penetration Test (VAPT) - Vendor Engagement

Dear MD,

Thanks for you support.

I will reach out to the vendor to commence implementation.

Warm regards.

Get Outlook for iOS<https://aka.ms/o0ukef>
________________________________
From: Emmanuel Bassey <emmanuel.bassey@assetsmfb.com>
Sent: Monday, 31 August 2026 16:05:40
To: John Moses <John.Moses@whytelabeltech.com>; Office of the MD <office.md@assetsmfb.com>; Praise Sanusi <praise.sanusi@assetsmfb.com>
Cc: Saheed Otusajo <saheed.otusajo@canarypointholding.com>; Wisdom Ibanga <wisdom.ibanga@whytelabeltech.com>; Abayomi Olufemi <abayomi.olufemi@whytelabeltech.com>
Subject: Re: Vulnerability Assessment and Penetration Test (VAPT) - Vendor Engagement

Thanks John,

This is approved.


________________________________
From: John Moses <John.Moses@whytelabeltech.com>
Sent: Monday, August 31, 2026 9:13 AM
To: Office of the MD <office.md@assetsmfb.com>; Praise Sanusi <praise.sanusi@assetsmfb.com>
Cc: Saheed Otusajo <saheed.otusajo@canarypointholding.com>; Wisdom Ibanga <wisdom.ibanga@whytelabeltech.com>; Abayomi Olufemi <abayomi.olufemi@whytelabeltech.com>; Emmanuel Bassey <emmanuel.bassey@assetsmfb.com>
Subject: Re: Vulnerability Assessment and Penetration Test (VAPT) - Vendor Engagement

Dear Praise,

As discussed.

I am bumping this to the top of you mail.

Warm regards,

________________________________
From: John Moses <John.Moses@whytelabeltech.com>
Sent: Monday, August 17, 2026 11:36 AM
To: Emmanuel Bassey <emmanuel.bassey@assetsmfb.com>; Office of the MD <office.md@assetsmfb.com>
Cc: Saheed Otusajo <saheed.otusajo@canarypointholding.com>; Wisdom Ibanga <wisdom.ibanga@whytelabeltech.com>; Abayomi Olufemi <abayomi.olufemi@whytelabeltech.com>
Subject: Re: Vulnerability Assessment and Penetration Test (VAPT) - Vendor Engagement

Dear MD,
I am writing to follow up on the outstanding approval for this activity.
The timely execution of the independent VAPT assessment is critical, as it is currently a dependency for some of our ongoing third-party vendor integrations. The vendors have specifically requested evidence of an independent security assessment before proceeding with the integrations.
Kindly assist with the necessary approval to proceed with the engagement of the vendor and avoid further delays to the ongoing integrations.
Warm regards,
________________________________
From: John Moses <John.Moses@whytelabeltech.com>
Sent: Thursday, July 30, 2026 1:46 PM
To: Emmanuel Bassey <emmanuel.bassey@assetsmfb.com>; Office of the MD <office.md@assetsmfb.com>
Cc: Saheed Otusajo <saheed.otusajo@canarypointholding.com>; Wisdom Ibanga <wisdom.ibanga@whytelabeltech.com>; Abayomi Olufemi <abayomi.olufemi@whytelabeltech.com>
Subject: Re: Vulnerability Assessment and Penetration Test (VAPT)

Dear MD,
Following your previous approval to engage Vendors to help with our Annual Independent VAPT.
I would like to seek your approval for the attached Vulnerability Assessment and Penetration Testing (VAPT) engagement proposal from Kreatix Technologies for our organization''s infrastructure.
The engagement will cover both External and Internal Network VAPT, including our public-facing applications, APIs, servers, network infrastructure, firewalls, VPNs, wireless environment, and overall security architecture.
The assessment is designed to independently validate our security posture through controlled penetration testing and provide both Executive and Technical reports with remediation recommendations. The engagement is expected to be completed within 15 business days, with a total project cost of â¦2,365,000 (inclusive of VAT). A 70% Down payment is required to commence without delay.
This engagement is important for the following reasons:

  *   Regulatory Compliance: It supports our compliance obligations under the Central Bank of Nigeria (CBN) Cybersecurity Framework and the Nigeria Data Protection Act (NDPA), both of which require periodic independent security assessments of critical systems.

  *   Independent Security Assurance: It provides an independent review of our security controls to identify vulnerabilities before they can be exploited, ensuring management has an objective assessment of our cyber risk posture.

  *   NPS Integration Requirement: Completion of an independent VAPT is a mandatory prerequisite for our NPS integration. At present, this assessment is a critical blocker, and the integration cannot proceed until the VAPT has been successfully completed and the findings addressed where necessary.

Given the regulatory significance and our dependence on the NPS integration timeline, I kindly request your approval to proceed with this engagement so we can commence the assessment without delay.

Warm regards,
________________________________
From: akoma@kreatixtech.com <akoma@kreatixtech.com>
Sent: Wednesday, July 29, 2026 6:58 PM
To: John Moses <john.moses@whytelabeltech.com>
Cc: Saheed Otusajo <saheed.otusajo@canarypointholding.com>; Wisdom Ibanga <wisdom.ibanga@whytelabeltech.com>; Emmanuel Bassey <emmanuel.bassey@assetsmfb.com>
Subject: Vulnerability Assessment and Penetration Test (VAPT)

â  WARNING: THIS EMAIL ORIGINATED FROM AN EXTERNAL SOURCE. DO NOT CLICK LINKS OR OPEN ATTACHMENTS UNLESS YOU RECOGNIZE THE SENDER AND KNOW THE CONTENT IS SAFE.
Hello John.

Thanks for reaching out. With regard to the VAPT exercise, find attached our proposal in view of your stated scope.

We took due consideration of our commitment to keep you as our clients and gave you our best price.

We are keen to work with you to ensure you have a greater security profile for your applications.


Onyedikachi Akoma
Business Head
+234 7039612627
akoma@kreatixtech.com
https://kreatixtech.com


Best regards,
John Moses
Lead Information Security Officer
Assets Microfinance Bank
ð   17A, Dele Adedeji Street, Off Bisola Durosimi-Etti Street, Lekki Phase 1
ð
âï¸   John.Moses@whytelabeltech.com<mailto:John.Moses@whytelabeltech.com>
ð   https://www.assetsmfb.com/
[Assets Microfinance Bank]


Best regards,
Emmanuel M Bassey
MD/CEO
Assets Microfinance Bank
ð   17A, Dele Adedeji Street, Off Bisola Durosimi-Etti Street, Lekki Phase 1
ð   07047649155
âï¸   emmanuel.bassey@assetsmfb.com<mailto:emmanuel.bassey@assetsmfb.com>
ð   https://www.assetsmfb.com/
[Assets Microfinance Bank]
This email (including attachments) contains information which may be confidential and legally privileged unless the content clearly indicates otherwise, it is intended solely for the use of the individual or entity to whom it is addressed. Unless you are the intended recipient, you may not use, copy or disclose to anyone the message or any information contained in the message or from any attachments that were sent with this email, and if you have received this email message in error, please notify the sender by email, and delete the message. Any use, dissemination, distribution, or reproduction of this message by unintended recipients is not authorised. Caution should be observed in placing any reliance upon any information contained in this e-mail, which is not intended to be a representation to make any decision and any decision taken based on the information provided in this e-mail, should only be made after consultation with appropriate legal, regulatory, technical, financial, and accounting advisors. Assets MFB accepts no responsibility whatsoever for any loss, direct, indirect or consequential, arising from information made available and actions resulting there from. For more information about Asset Microfinance Bank, please visit us at www.assetsmfb.com


Best regards,
John Moses
Lead Information Security Officer
Assets Microfinance Bank
ð   17A, Dele Adedeji Street, Off Bisola Durosimi-Etti Street, Lekki Phase 1
ð
âï¸   John.Moses@whytelabeltech.com <mailto:John.Moses@whytelabeltech.com>
ð   https://www.assetsmfb.com/
[Assets Microfinance Bank]
', '<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<style type="text/css" style="display:none;"> P {margin-top:0;margin-bottom:0;} </style>
</head>
<body dir="ltr">
<div class="elementToProof" style="font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Dear Okoma,</div>
<div class="elementToProof" style="font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<div class="elementToProof" style="font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Top of the morning to you.</div>
<div class="elementToProof" style="font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<div class="elementToProof" style="font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
As disscused, kindly share an invoice that contains a means of mobilization payment.</div>
<div class="elementToProof" style="font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<div class="elementToProof" style="font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Warm regards,</div>
<hr style="display: inline-block; width: 98%;">
<div id="divRplyFwdMsg">
<div style="direction: ltr; font-family: Calibri, sans-serif; font-size: 11pt; color: rgb(0, 0, 0);">
<b>From:</b> John Moses &lt;John.Moses@whytelabeltech.com&gt;<br>
<b>Sent:</b> Monday, August 31, 2026 6:52 PM<br>
<b>To:</b> Emmanuel Bassey &lt;emmanuel.bassey@assetsmfb.com&gt;; Office of the MD &lt;office.md@assetsmfb.com&gt;; Praise Sanusi &lt;praise.sanusi@assetsmfb.com&gt;<br>
<b>Cc:</b> Saheed Otusajo &lt;saheed.otusajo@canarypointholding.com&gt;; Wisdom Ibanga &lt;wisdom.ibanga@whytelabeltech.com&gt;; Abayomi Olufemi &lt;abayomi.olufemi@whytelabeltech.com&gt;<br>
<b>Subject:</b> Re: Vulnerability Assessment and Penetration Test (VAPT) - Vendor Engagement</div>
<div style="direction: ltr;">&nbsp;</div>
</div>
<div style="direction: ltr; font-family: Aptos, Aptos_MSFontService, -apple-system, Roboto, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Dear MD,</div>
<div style="direction: ltr; font-family: Aptos, Aptos_MSFontService, -apple-system, Roboto, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<div style="direction: ltr; font-family: Aptos, Aptos_MSFontService, -apple-system, Roboto, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Thanks for you support.</div>
<div style="direction: ltr; font-family: Aptos, Aptos_MSFontService, -apple-system, Roboto, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<div style="direction: ltr; font-family: Aptos, Aptos_MSFontService, -apple-system, Roboto, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
I will reach out to the vendor to commence implementation.</div>
<div style="direction: ltr; font-family: Aptos, Aptos_MSFontService, -apple-system, Roboto, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<div style="direction: ltr; font-family: Aptos, Aptos_MSFontService, -apple-system, Roboto, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Warm regards.</div>
<div id="x_ms-outlook-mobile-body-separator-line">
<div style="direction: ltr; font-family: Aptos, Aptos_MSFontService, -apple-system, Roboto, Arial, Helvetica, sans-serif; font-size: 12pt;">
<br>
</div>
</div>
<div id="x_ms-outlook-mobile-signature">
<div style="direction: ltr; font-family: Aptos, Aptos_MSFontService, -apple-system, Roboto, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Get <a href="https://aka.ms/o0ukef" id="OWA93542c01-ff1a-aee0-7275-00f70d581b74" class="OWAAutoLink" data-auth="NotApplicable">
Outlook for iOS</a></div>
</div>
<hr style="display: inline-block; width: 98%;">
<div id="x_divRplyFwdMsg">
<div style="direction: ltr; font-family: Calibri, sans-serif; font-size: 11pt; color: rgb(0, 0, 0);">
<b>From:</b> Emmanuel Bassey &lt;emmanuel.bassey@assetsmfb.com&gt;<br>
<b>Sent:</b> Monday, 31 August 2026 16:05:40<br>
<b>To:</b> John Moses &lt;John.Moses@whytelabeltech.com&gt;; Office of the MD &lt;office.md@assetsmfb.com&gt;; Praise Sanusi &lt;praise.sanusi@assetsmfb.com&gt;<br>
<b>Cc:</b> Saheed Otusajo &lt;saheed.otusajo@canarypointholding.com&gt;; Wisdom Ibanga &lt;wisdom.ibanga@whytelabeltech.com&gt;; Abayomi Olufemi &lt;abayomi.olufemi@whytelabeltech.com&gt;<br>
<b>Subject:</b> Re: Vulnerability Assessment and Penetration Test (VAPT) - Vendor Engagement</div>
<div style="direction: ltr;">&nbsp;</div>
</div>
<div style="direction: ltr; font-family: &quot;Product Sans&quot;; font-size: 10pt; color: rgb(0, 0, 0);">
Thanks John,</div>
<div style="direction: ltr; font-family: &quot;Product Sans&quot;; font-size: 10pt; color: rgb(0, 0, 0);">
<br>
</div>
<div style="direction: ltr; font-family: &quot;Product Sans&quot;; font-size: 10pt; color: rgb(0, 0, 0);">
This is approved.</div>
<div style="direction: ltr;"><br>
</div>
<div style="direction: ltr; font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<hr style="direction: ltr; display: inline-block; width: 98%;">
<div style="direction: ltr; font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<b>From:</b> John Moses &lt;John.Moses@whytelabeltech.com&gt;<br>
<b>Sent:</b> Monday, August 31, 2026 9:13 AM<br>
<b>To:</b> Office of the MD &lt;office.md@assetsmfb.com&gt;; Praise Sanusi &lt;praise.sanusi@assetsmfb.com&gt;<br>
<b>Cc:</b> Saheed Otusajo &lt;saheed.otusajo@canarypointholding.com&gt;; Wisdom Ibanga &lt;wisdom.ibanga@whytelabeltech.com&gt;; Abayomi Olufemi &lt;abayomi.olufemi@whytelabeltech.com&gt;; Emmanuel Bassey &lt;emmanuel.bassey@assetsmfb.com&gt;<br>
<b>Subject:</b> Re: Vulnerability Assessment and Penetration Test (VAPT) - Vendor Engagement</div>
<div style="direction: ltr; font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Dear Praise,</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
As discussed.</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
I am bumping this to the top of you mail.</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Warm regards,</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<hr style="direction: ltr; display: inline-block; width: 98%;">
<div id="x_x_x_divRplyFwdMsg">
<div style="direction: ltr; font-family: Calibri, sans-serif; font-size: 11pt; color: rgb(0, 0, 0);">
<b>From:</b> John Moses &lt;John.Moses@whytelabeltech.com&gt;<br>
<b>Sent:</b> Monday, August 17, 2026 11:36 AM<br>
<b>To:</b> Emmanuel Bassey &lt;emmanuel.bassey@assetsmfb.com&gt;; Office of the MD &lt;office.md@assetsmfb.com&gt;<br>
<b>Cc:</b> Saheed Otusajo &lt;saheed.otusajo@canarypointholding.com&gt;; Wisdom Ibanga &lt;wisdom.ibanga@whytelabeltech.com&gt;; Abayomi Olufemi &lt;abayomi.olufemi@whytelabeltech.com&gt;<br>
<b>Subject:</b> Re: Vulnerability Assessment and Penetration Test (VAPT) - Vendor Engagement</div>
<div style="direction: ltr;">&nbsp;</div>
</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Dear MD,</div>
<div style="direction: ltr; margin-top: 1em; margin-bottom: 1em; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
I am writing to follow up on the outstanding approval for this activity.</div>
<div style="direction: ltr; margin-top: 1em; margin-bottom: 1em; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
The timely execution of the independent VAPT assessment is critical, as it is currently a dependency for some of our ongoing third-party vendor integrations. The vendors have specifically requested evidence of an independent security assessment before proceeding
 with the integrations.</div>
<div style="direction: ltr; margin-top: 1em; margin-bottom: 1em; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Kindly assist with the necessary approval to proceed with the engagement of the vendor and avoid further delays to the ongoing integrations.</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Warm regards,</div>
<hr style="direction: ltr; display: inline-block; width: 98%;">
<div id="x_x_x_x_divRplyFwdMsg">
<div style="direction: ltr; font-family: Calibri, sans-serif; font-size: 11pt; color: rgb(0, 0, 0);">
<b>From:</b> John Moses &lt;John.Moses@whytelabeltech.com&gt;<br>
<b>Sent:</b> Thursday, July 30, 2026 1:46 PM<br>
<b>To:</b> Emmanuel Bassey &lt;emmanuel.bassey@assetsmfb.com&gt;; Office of the MD &lt;office.md@assetsmfb.com&gt;<br>
<b>Cc:</b> Saheed Otusajo &lt;saheed.otusajo@canarypointholding.com&gt;; Wisdom Ibanga &lt;wisdom.ibanga@whytelabeltech.com&gt;; Abayomi Olufemi &lt;abayomi.olufemi@whytelabeltech.com&gt;<br>
<b>Subject:</b> Re: Vulnerability Assessment and Penetration Test (VAPT)</div>
<div style="direction: ltr;">&nbsp;</div>
</div>
<div style="direction: ltr; margin-top: 1em; margin-bottom: 1em; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Dear MD,</div>
<div style="direction: ltr; margin-top: 1em; margin-bottom: 1em; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Following your previous approval to engage Vendors to help with our Annual Independent VAPT.</div>
<div style="direction: ltr; margin-top: 1em; margin-bottom: 1em; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
I would like to seek your approval for the attached Vulnerability Assessment and Penetration Testing (VAPT) engagement proposal from Kreatix Technologies for our organization''s infrastructure.</div>
<div style="direction: ltr; margin-top: 1em; margin-bottom: 1em; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
The engagement will cover both <b>External and Internal Network VAPT</b>, including our public-facing applications, APIs, servers, network infrastructure, firewalls, VPNs, wireless environment, and overall security architecture.</div>
<div style="direction: ltr; margin-top: 1em; margin-bottom: 1em; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
The assessment is designed to independently validate our security posture through controlled penetration testing and provide both Executive and Technical reports with remediation recommendations. The engagement is expected to be completed within
<b>15 business days</b>, with a total project cost of <b>â¦2,365,000 (inclusive of VAT)</b>. A
<b>70%</b> Down payment is required to commence without delay.</div>
<div style="direction: ltr; margin-top: 1em; margin-bottom: 1em; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
This engagement is important for the following reasons:</div>
<ul data-start="1082" data-end="1887" style="direction: ltr;">
<li style="font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<p role="presentation" style="direction: ltr; margin-top: 12pt; margin-bottom: 0px;">
<b>Regulatory Compliance:</b> It supports our compliance obligations under the <b>
Central Bank of Nigeria (CBN) Cybersecurity Framework</b> and the <b>Nigeria Data Protection Act (NDPA)</b>, both of which require periodic independent security assessments of critical systems.</p>
</li><li style="font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<p role="presentation" style="direction: ltr; margin-top: 12pt; margin-bottom: 0px;">
<b>Independent Security Assurance:</b> It provides an independent review of our security controls to identify vulnerabilities before they can be exploited, ensuring management has an objective assessment of our cyber risk posture.</p>
</li><li style="font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<p role="presentation" style="direction: ltr; margin-top: 12pt; margin-bottom: 0px;">
<b>NPS Integration Requirement:</b> Completion of an independent VAPT is a <b>mandatory prerequisite for our NPS integration</b>. At present, this assessment is a
<b>critical blocker</b>, and the integration cannot proceed until the VAPT has been successfully completed and the findings addressed where necessary.</p>
</li></ul>
<p style="direction: ltr; margin-top: 12pt; margin-bottom: 1em; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Given the regulatory significance and our dependence on the NPS integration timeline, I kindly request your approval to proceed with this engagement so we can commence the assessment without delay.</p>
<div style="direction: ltr; margin-top: 1em; margin-bottom: 1em; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Warm regards,</div>
<hr style="direction: ltr; display: inline-block; width: 98%;">
<div id="x_x_x_x_x_divRplyFwdMsg">
<div style="direction: ltr; font-family: Calibri, sans-serif; font-size: 11pt; color: rgb(0, 0, 0);">
<b>From:</b> akoma@kreatixtech.com &lt;akoma@kreatixtech.com&gt;<br>
<b>Sent:</b> Wednesday, July 29, 2026 6:58 PM<br>
<b>To:</b> John Moses &lt;john.moses@whytelabeltech.com&gt;<br>
<b>Cc:</b> Saheed Otusajo &lt;saheed.otusajo@canarypointholding.com&gt;; Wisdom Ibanga &lt;wisdom.ibanga@whytelabeltech.com&gt;; Emmanuel Bassey &lt;emmanuel.bassey@assetsmfb.com&gt;<br>
<b>Subject:</b> Vulnerability Assessment and Penetration Test (VAPT)</div>
<div style="direction: ltr;">&nbsp;</div>
</div>
<div style="direction: ltr; background-color: rgb(255, 243, 205); padding: 10px; border-width: 2px; border-style: solid; border-color: red; color: rgb(133, 100, 4);">
<b>â  WARNING: THIS EMAIL ORIGINATED FROM AN EXTERNAL SOURCE. DO NOT CLICK LINKS OR OPEN ATTACHMENTS UNLESS YOU RECOGNIZE THE SENDER AND KNOW THE CONTENT IS SAFE.</b></div>
<div style="direction: ltr; text-align: left; text-indent: 0px; background-color: rgb(255, 255, 255); margin: 0px; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: black;">
Hello John.&nbsp;</div>
<div style="direction: ltr; text-align: left; text-indent: 0px; background-color: rgb(255, 255, 255); margin: 0px; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: black;">
<br>
</div>
<div style="direction: ltr; text-align: left; text-indent: 0px; background-color: rgb(255, 255, 255); margin: 0px; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: black;">
Thanks for reaching out. With regard to the VAPT exercise, find attached our proposal in view of your stated scope.&nbsp;</div>
<div style="direction: ltr; text-align: left; text-indent: 0px; background-color: rgb(255, 255, 255); margin: 0px; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: black;">
<br>
</div>
<div style="direction: ltr; text-align: left; text-indent: 0px; background-color: rgb(255, 255, 255); margin: 0px; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: black;">
We took due consideration of our commitment to keep you as our clients and gave you our best price.&nbsp;</div>
<div style="direction: ltr; text-align: left; text-indent: 0px; background-color: rgb(255, 255, 255); margin: 0px; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: black;">
<br>
</div>
<div style="direction: ltr; text-align: left; text-indent: 0px; background-color: rgb(255, 255, 255); margin: 0px; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: black;">
We are keen to work with you to ensure you have a greater security profile for your applications.</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<div id="x_x_x_x_x_x_Signature">
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<b>Onyedikachi Akoma</b></div>
<div style="direction: ltr; font-family: &quot;Ink Free&quot;; font-size: 12pt; color: rgb(0, 0, 0);">
<i>Business Head</i></div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
+234 7039612627</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
akoma@kreatixtech.com</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<span class="spanWithBackgroundColor" style="background-color: rgb(255, 255, 0);">https://kreatixtech.com</span></div>
</div>
<div style="direction: ltr;"><br>
<br>
</div>
<table cellspacing="0" cellpadding="0" border="0" style="direction: ltr; width: 600px; color: rgb(17, 24, 39);">
<tbody>
<tr>
<td style="direction: ltr; padding-bottom: 8px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif; font-size: 11pt; color: rgb(17, 24, 39);">
Best regards,</div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 3px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif; font-size: 14.5pt; color: rgb(11, 94, 215);">
<b>John Moses</b></div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 4px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif; font-size: 11.5pt; color: rgb(55, 65, 81);">
<b>Lead Information Security Officer</b></div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 10px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif; font-size: 10.8pt; color: rgb(17, 24, 39);">
<b>Assets Microfinance Bank</b></div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 4px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif;"><span style="font-size: 10.5pt; color: rgb(11, 94, 215);">ð</span><span style="font-size: 10.5pt; color: rgb(17, 24, 39);">&nbsp;&nbsp;
</span><span style="font-size: 10.2pt; color: rgb(17, 24, 39);">17A, Dele Adedeji Street, Off Bisola Durosimi-Etti Street, Lekki Phase 1</span></div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 4px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif; font-size: 10.5pt;">
<span style="color: rgb(11, 94, 215);">ð</span><span style="color: rgb(17, 24, 39);">&nbsp;&nbsp;</span></div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 4px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif;"><span style="font-size: 10.5pt; color: rgb(11, 94, 215);">âï¸</span><span style="font-size: 10.5pt; color: rgb(17, 24, 39);">&nbsp;&nbsp;
</span><span style="font-size: 10.2pt; color: rgb(30, 102, 245);"><a href="mailto:John.Moses@whytelabeltech.com" id="OWA0e3056d5-b73e-1bea-3ffd-f5a3f77954aa" class="x_x_OWAAutoLink" style="color: rgb(30, 102, 245);"><u>John.Moses@whytelabeltech.com</u></a></span></div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 14px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif;"><span style="font-size: 10.5pt; color: rgb(11, 94, 215);">ð</span><span style="font-size: 10.5pt; color: rgb(17, 24, 39);">&nbsp;&nbsp;
</span><span style="font-size: 10.2pt; color: rgb(30, 102, 245);"><a href="https://www.assetsmfb.com/" id="OWA5328a01b-e665-cdd3-3198-e00ff058f8b7" class="x_x_OWAAutoLink" originalsrc="https://www.assetsmfb.com/" data-auth="NotApplicable" style="color: rgb(30, 102, 245);"><u>https://www.assetsmfb.com/</u></a></span></div>
</td>
</tr>
<tr>
<td style="direction: ltr;"><span style="font-family: &quot;Segoe UI&quot;, Arial, sans-serif; font-size: 10.5pt; color: rgb(17, 24, 39);"><img alt="Assets Microfinance Bank" width="600" style="width: 600px; height: auto; max-width: 600px; display: block;" src="https://i.imghippo.com/files/qPra7700jIE.png"></span></td>
</tr>
</tbody>
</table>
<div style="direction: ltr;"><br>
<br>
</div>
<table cellspacing="0" cellpadding="0" border="0" style="direction: ltr; width: 600px; color: rgb(17, 24, 39);">
<tbody>
<tr>
<td style="direction: ltr; padding-bottom: 8px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif; font-size: 11pt; color: rgb(17, 24, 39);">
Best regards,</div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 3px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif; font-size: 14.5pt; color: rgb(11, 94, 215);">
<b>Emmanuel M Bassey</b></div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 4px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif; font-size: 11.5pt; color: rgb(55, 65, 81);">
<b>MD/CEO</b></div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 10px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif; font-size: 10.8pt; color: rgb(17, 24, 39);">
<b>Assets Microfinance Bank</b></div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 4px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif;"><span style="font-size: 10.5pt; color: rgb(11, 94, 215);">ð</span><span style="font-size: 10.5pt; color: rgb(17, 24, 39);">&nbsp;&nbsp;
</span><span style="font-size: 10.2pt; color: rgb(17, 24, 39);">17A, Dele Adedeji Street, Off Bisola Durosimi-Etti Street, Lekki Phase 1</span></div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 4px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif;"><span style="font-size: 10.5pt; color: rgb(11, 94, 215);">ð</span><span style="font-size: 10.5pt; color: rgb(17, 24, 39);">&nbsp;&nbsp;
</span><span style="font-size: 10.2pt; color: rgb(17, 24, 39);">07047649155</span></div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 4px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif;"><span style="font-size: 10.5pt; color: rgb(11, 94, 215);">âï¸</span><span style="font-size: 10.5pt; color: rgb(17, 24, 39);">&nbsp;&nbsp;
</span><span style="font-size: 10.2pt; color: rgb(30, 102, 245);"><a href="mailto:emmanuel.bassey@assetsmfb.com" id="OWA527c5fbb-52d7-009e-e17d-be87b5626494" class="OWAAutoLink" style="color: rgb(30, 102, 245);"><u>emmanuel.bassey@assetsmfb.com</u></a></span></div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 14px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif;"><span style="font-size: 10.5pt; color: rgb(11, 94, 215);">ð</span><span style="font-size: 10.5pt; color: rgb(17, 24, 39);">&nbsp;&nbsp;
</span><span style="font-size: 10.2pt; color: rgb(30, 102, 245);"><a href="https://www.assetsmfb.com/" id="OWA46d4fda0-bb2b-f9a4-3510-1f198c8ed300" class="OWAAutoLink" originalsrc="https://www.assetsmfb.com/" data-auth="NotApplicable" style="color: rgb(30, 102, 245);"><u>https://www.assetsmfb.com/</u></a></span></div>
</td>
</tr>
<tr>
<td style="direction: ltr;"><span style="font-family: &quot;Segoe UI&quot;, Arial, sans-serif; font-size: 10.5pt; color: rgb(17, 24, 39);"><img alt="Assets Microfinance Bank" width="600" style="width: 600px; height: auto; max-width: 600px; display: block;" src="https://i.imghippo.com/files/qPra7700jIE.png"></span></td>
</tr>
</tbody>
</table>
<div style="direction: ltr;">This email (including attachments) contains information which may be confidential and legally privileged unless the content clearly indicates otherwise, it is intended solely for the use of the individual or entity to whom it is
 addressed. Unless you are the intended recipient, you may not use, copy or disclose to anyone the message or any information contained in the message or from any attachments that were sent with this email, and if you have received this email message in error,
 please notify the sender by email, and delete the message. Any use, dissemination, distribution, or reproduction of this message by unintended recipients is not authorised. Caution should be observed in placing any reliance upon any information contained in
 this e-mail, which is not intended to be a representation to make any decision and any decision taken based on the information provided in this e-mail, should only be made after consultation with appropriate legal, regulatory, technical, financial, and accounting
 advisors. Assets MFB accepts no responsibility whatsoever for any loss, direct, indirect or consequential, arising from information made available and actions resulting there from. For more information about Asset Microfinance Bank, please visit us at www.assetsmfb.com</div>
<br>
<br>
<table cellpadding="0" cellspacing="0" border="0" width="600" style="font-family: Segoe UI, Arial, sans-serif; color:#111827; font-size:10.5pt;">
<!-- Best regards -->
<tbody>
<tr>
<td style="padding-bottom:8px;"><span style="font-size:11pt;">Best regards,</span>
</td>
</tr>
<!-- Name -->
<tr>
<td style="padding-bottom:3px;"><span style="font-size:14.5pt; font-weight:bold; color:#0B5ED7;">John Moses
</span></td>
</tr>
<!-- Job title (auto-collapses if empty) -->
<tr>
<td style="padding-bottom:4px;"><span style="font-size:11.5pt; font-weight:bold; color:#374151;">Lead Information Security Officer
</span></td>
</tr>
<!-- Company -->
<tr>
<td style="padding-bottom:10px;"><span style="font-size:10.8pt; font-weight:bold;">Assets Microfinance Bank
</span></td>
</tr>
<!-- Address (static, always shown) -->
<tr>
<td style="padding-bottom:4px;"><span style="color:#0B5ED7;">ð</span>&nbsp;&nbsp; <span style="font-size:10.2pt;">
17A, Dele Adedeji Street, Off Bisola Durosimi-Etti Street, Lekki Phase 1 </span></td>
</tr>
<!-- Phone (minimised if empty) -->
<tr>
<td style="padding-bottom:4px;"><span style="color:#0B5ED7;">ð</span>&nbsp;&nbsp; <span style="font-size:10.2pt;">
</span></td>
</tr>
<!-- Email (almost always present) -->
<tr>
<td style="padding-bottom:4px;"><span style="color:#0B5ED7;">âï¸</span>&nbsp;&nbsp; <span style="font-size:10.2pt;">
<a href="mailto:John.Moses@whytelabeltech.com" style="color:#1E66F5; text-decoration:underline;">John.Moses@whytelabeltech.com
</a></span></td>
</tr>
<!-- Website -->
<tr>
<td style="padding-bottom:14px;"><span style="color:#0B5ED7;">ð</span>&nbsp;&nbsp; <span style="font-size:10.2pt;">
<a href="https://www.assetsmfb.com/" style="color:#1E66F5; text-decoration:underline;">https://www.assetsmfb.com/
</a></span></td>
</tr>
<!-- Banner -->
<tr>
<td><img src="https://i.imghippo.com/files/qPra7700jIE.png" alt="Assets Microfinance Bank" width="600" style="display:block; border:0; max-width:600px; height:auto;">
</td>
</tr>
</tbody>
</table>
</body>
</html>
', 'Dear Okoma, Top of the morning to you. As disscused, kindly share an invoice that contains a means of mobilization payment. Warm regards, ________________________________ From: John Moses <John.Moses@...', 1, 1, 0, 0, 0, 0, 38980, 'inbound', 'received', '2026-09-02 06:57:29', NULL, '2026-09-02 06:57:29', '2026-09-02 07:01:01', NULL);
INSERT INTO emails (id, user_id, message_id, thread_id, in_reply_to, ref_header, from_address, from_name, to_address, cc_address, bcc_address, reply_to, subject, text, html, snippet, folder_id, is_read, is_starred, is_important, is_draft, has_attachments, size, direction, status, received_at, sent_at, created_at, updated_at, snooze_until) VALUES (5, 1, '<010001a06123bc2e-4265f357-8671-465d-aed0-cfa2f84814e0-000000@email.amazonses.com>', 'thread-final-notice--30-days-until-partner-central-migration-deadline-apn-info@amazon.com', NULL, NULL, 'apn-info@amazon.com', 'AWS Partner Network', 'akoma@kreatixtech.com', NULL, NULL, NULL, 'Final notice: 30 Days until Partner Central Migration deadline', 'If you have already migrated to the new AWS Partner Central experience, please ignore this reminder

This is an urgent reminder: you have 30 days remaining to migrate to the new Partner Central experience. The deadline is September 30, 2026.

Effective October 1, partners who have not yet migrated to the new Partner Central experience will lose access to nearly all functionality in Partner Central, including submitting fund requests, managing claims, and creating or progressing opportunities. No data is lost, and all functionality (including in-progress workflows) resumes immediately upon completing migration. See FAQ https://partnercentral.awspartner.com/partnercentral2/s/article?category=Introductory_resources&article=Partner-Central-Migration-Guide-FAQ#Partner-Central-in-the-AWS-Console---FAQs for details.

Take action today

- Log in to Partner Central https://partnercentral.awspartner.com/partnercentral2/s/login with your company email and password.
- Follow the migration wizard to complete your migration steps.
- Coordinate with your IAM Administrator to ensure user access is set up correctly.


Need migration support? Explore professional services https://aws.amazon.com/partners/partner-central/#need-partner-central-migration-support from AWS Partners to help.

Resources

- Read the migration FAQ https://partnercentral.awspartner.com/partnercentral2/s/article?category=Introductory_resources&article=Partner-Central-Migration-Guide and Watch the migration demo https://awsmarketplace.storylane.io/share/nfttcp3co17e
- Join our LinkedIn community https://www.linkedin.com/groups/16098241/
Amazon Web Services, Inc. is a subsidiary of Amazon.com, Inc. Amazon.com is a registered trademark of Amazon.com.
This message was produced and distributed by Amazon Web Services, Inc. or its affiliates https://aws.amazon.com/legal/marketingentities/, 410 Terry Ave. North, Seattle, WA 98109.
Â© 2026, Amazon Web Services, Inc. or its affiliates. All rights reserved. Read our Privacy Notice https://aws.amazon.com/privacy/.

', '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head> 
<title>Amazon Web Services</title> 
<!-- Always use in every email--> 
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /> 
<meta content="width=device-width, minimal-ui, initial-scale=1.0, maximum-scale=1.0, user-scalable=0;" name="viewport" /> 
<meta content="telephone=no" name="format-detection" /> 
<!-- For Dark Mode Code -----> 
<meta name="color-scheme" content="light dark" /> 
<meta name="supported-color-schemes" content="light dark only" />  
<!-- MODULE 01 ----->   
<!-- MODULE 02 STARTS ----->     
<!-- BANNER MODULE VERSION 1 ----->    
<!-- MODULE 02 BANNER VARIABLES ---->    
<!-- MODULE 03 VARIABLES ----->     
<!-- MODULE 04 STARTS ----->    
<!-- BODY TEXT 05 VARIABLES ----->                       
<!-- MODULE 06 VARIABLES ----->                                              
<!-- MODULE 07 VARIABLES ------->       
<!-- MODULE 08 VARIABLES ---->        
<!-- MODULE 09 VARIABLES ---->        
<!-- MODULE 10 VARIABLES ----->       
<!--CTA Variable   --> 
<style>
        @font-face {
            font-family: ''AmazonEmber-Light'';
            src: url(''https://pages.awscloud.com/rs/112-TZM-766/images/AmazonEmberDisplay_W_Lt.woff2'') format(''woff2''),
                url(''https://pages.awscloud.com/rs/112-TZM-766/images/AmazonEmberDisplay_W_Lt.woff'') format(''woff''),
                url(''https://pages.awscloud.com/rs/112-TZM-766/images/AmazonEmberDisplay_W_Lt.eot'') format(''eot'');
            font-weight: normal;
            font-style: normal;
        }

        @font-face {
            font-family: ''AmazonEmber'';
            src: url(''https://pages.awscloud.com/rs/112-TZM-766/images/AmazonEmberDisplay_W_Rg.woff2'') format(''woff2''),
                url(''https://pages.awscloud.com/rs/112-TZM-766/images/AmazonEmberDisplay_W_Rg.woff'') format(''woff''),
                url(''https://pages.awscloud.com/rs/112-TZM-766/images/AmazonEmberDisplay_W_Rg.eot'') format(''eot''),
                url(''https://pages.awscloud.com/rs/112-TZM-766/images/AmazonEmberDisplay_W_Rg.ttf'') format(''truetype'');
            font-weight: normal;
            font-style: normal;
        }

        @font-face {
            font-family: ''AmazonEmber-Bold'';
            src: url(''https://pages.awscloud.com/rs/112-TZM-766/images/AmazonEmberDisplay_W_Bd.woff2'') format(''woff2''),
                url(''https://pages.awscloud.com/rs/112-TZM-766/images/AmazonEmberDisplay_W_Bd.woff'') format(''woff''),
                url(''https://pages.awscloud.com/rs/112-TZM-766/images/AmazonEmberDisplay_W_Bd.eot'') format(''eot''),
                url(''https://pages.awscloud.com/rs/112-TZM-766/images/AmazonEmberDisplay_W_Bd.ttf'') format(''truetype'');
            font-weight: bold;
            font-style: normal;
        }

        @font-face {
            font-family: ''AmazonEmber-Heavy'';
            src: url(''https://pages.awscloud.com/rs/112-TZM-766/images/AmazonEmberDisplay_W_He.woff2'') format(''woff2''),
                url(''https://pages.awscloud.com/rs/112-TZM-766/images/AmazonEmberDisplay_W_He.woff'') format(''woff''),
                url(''https://pages.awscloud.com/rs/112-TZM-766/images/AmazonEmberDisplay_W_He.eot'') format(''eot'');
            font-weight: normal;
            font-style: normal;
        }
    </style> 
<!--[if gte mso 9]>
      <xml>
         <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
         </o:OfficeDocumentSettings>
      </xml>
      <![endif]--> 
<!--[if mso]>
    <style> body,table tr,table td, table th, a, span,table.MsoNormalTable { font-family: Arial, Helvetica, sans-serif !important;   }
        strong , b {  font-weight: 700; font-family: Arial, Helvetica, sans-serif !important;  font-size: 16px !important; line-height: 24px !important;}
    </style>
    <!--<![endif]--> 
<!--[if gte mso 9]>
      <style type="text/css">
         .outlook{padding-top:0px !important;}
      </style>
      <![endif]--> 
<style type="text/css">
        :root {
            color-scheme: light dark;
            supported-color-schemes: light dark;
        }
    </style> 
<style type="text/css">
        .font-family-decor {
            font-family: ''AmazonEmber'';
        }

        strong {
            font-weight: 600 !important;
            font-family: ''AmazonEmber'' , Helvetica, arial, sans-serif !important;
        }

        b {
            font-weight: 600 !important;
            font-family: ''AmazonEmber'' , Helvetica, arial, sans-serif !important;
        }
    </style> 
<style type="text/css">
        @media (prefers-color-scheme: dark) {
            .btn-darkMode a {
                color: #fefefe !important;
                background-color: #161D26 !important;
                /* background-color: #f3f3f3 !important;*/
            }

            .btn-darkMode2 {
                border-color: #0972D3 !important;
                color: #161D26 !important;
            }

            .btn-darkMode2 a {
                color: #161D26 !important;
            }

            .white {
                color: #ffffff !important;
            }

            .dark {
                color: #232F3E !important;
            }

            .dark2 {
                color: #888888 !important;
            }

            .darkMode {
                background: #000000 !important;
            }

            .lightMode {
                background: #fefefe !important;
            }

            .lightMode1 {
                background-color: #fefefe !important;
            }

            .hide-darkmode {
                display: none;
                display: none !important;
            }

            .show-darkmode {
                display: table-row !important;
                overflow: visible !important;
                max-height: inherit !important;
                line-height: auto !important;
                visibility: inherit !important;
            }

            .dark-img {
                display: block !important;
                width: auto !important;
                overflow: visible !important;
                float: none !important;
                max-height: inherit !important;
                max-width: inherit !important;
                line-height: auto !important;
                margin-top: 0px !important;
                visibility: inherit !important;
            }

            .light-img {
                display: none;
                display: none !important;
            }

            .nav-headerLinks td,
            .nav-headerLinks td a {
                color: #0972D3 !important;
            }

        }
    </style> 
<style type="text/css">
        @media (prefers-color-scheme: dark) {
            [data-ogsc] .btn-darkMode {
                color: #fefefe !important;
                background-color: #161D26 !important;
                /* background-color: #f3f3f3 !important;*/
            }

            /*.btn-darkMode {
         color: #161D26 !important;
         background-color: #f3f3f3 !important;
         }*/
            [data-ogsc] .btn-darkMode a {
                color: #161D26 !important;
            }

            [data-ogsc] .btn-darkMode2 {
                border-color: #161D26 !important;
                color: ##161D26 !important;
            }

            [data-ogsc] .btn-darkMode2 a {
                color: #161D26 !important;
                ;
            }

            [data-ogsc] .white {
                color: #ffffff !important;
            }

            [data-ogsc] .darkMode {
                background: #000000 !important;
            }

            [data-ogsc] .dark {
                color: #232F3E !important;
            }

            [data-ogsc] .dark2 {
                color: #888888 !important;
            }

            [data-ogsc] .lightMode {
                background: #fefefe !important;
            }

            [data-ogsc] .lightMode1 {
                background-color: #fefefe !important;
            }

            [data-ogsc] .hide-darkmode {
                display: none;
                display: none !important;
            }

            [data-ogsc] .show-darkmode {
                display: table-row !important;
                overflow: visible !important;
                max-height: inherit !important;
                line-height: auto !important;
                visibility: inherit !important;
            }

            [data-ogsc] .dark-img {
                display: block !important;
                width: auto !important;
                overflow: visible !important;
                float: none !important;
                max-height: inherit !important;
                max-width: inherit !important;
                line-height: auto !important;
                margin-top: 0px !important;
                visibility: inherit !important;
            }

            [data-ogsc] .light-img {
                display: none !important;
            }

            [data-ogsc] .nav-headerLinks td,
            [data-ogsc] .nav-headerLinks td a {
                color: #0972D3 !important;
            }


        }
    </style> 
<style>
        @media (prefers-color-scheme: dark) {
            .dark-img {
                display: block !important;
                width: auto !important;
                overflow: visible !important;
                float: none !important;
                max-height: inherit !important;
                max-width: inherit !important;
                line-height: auto !important;
                margin-top: 0px !important;
                visibility: inherit !important;
            }

            .white {
                color: #ffffff !important;
            }

            .light-img {
                display: none !important;
            }

            .bgwhite {
                background-color: #ffffff !important;
            }


        }
    </style> 
<style media="all">
        html {
            -webkit-text-size-adjust: none;
        }

        body {
            -webkit-font-smoothing: antialiased !important;
            -webkit-text-size-adjust: none !important;
            width: 100% !important;
            height: 100% !important;
            font-family: ''AmazonEmber'', Helvetica, arial, sans-serif;
        }

        p,
        .undoreset div p,
        .undoreset p {
            margin-top: 14px;
            margin-bottom: 14px;
        }

        body,
        table tr,
        table td,
        a,
        span,
        table.MsoNormalTable,
        th {
            font-family: ''AmazonEmber'', Arial, Helvetica, sans-serif;
        }

        .btnLine {
            text-decoration: underline !important;
        }

        a[x-apple-data-detectors] {
            color: inherit !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }

        a {
            outline: none !important;
            color: #006CE0;
        }

        ul {
            margin-top: 0px !important;
            margin-bottom: 0px !important;
            padding-left: 30px !important;
        }

        @media only screen and (max-width: 680px) {
            .main {
                width: 100% !important;
                min-width: 100% !important;
            }

            .deviceWidth1 {
                width: 90% !important;
                min-width: 90% !important;
            }

            .deviceWidth2 {
                width: 80% !important;
                min-width: 80% !important
            }

            .block {
                display: block !important;
                margin: 0 auto !important;
                width: 100% !important;
            }

            .center {
                text-align: center !important;
            }

            .space {
                height: 8px;
            }

            .imgWidth img {
                max-width: 300px;
            }

            .full-width img {
                width: 100% !important;
                height: auto !important;
            }

            .pad-top {
                padding-top: 20px !important;
            }

            .left {
                text-align: left !important;
            }

            .bordernone {
                border: none !important;
            }

            .deskImg {
                display: none !important;
            }

            .mobileImg {
                display: block !important;
            }

            .cta-hide {
                display: inline-block !important;
            }

            .cta-show {
                display: none !important;
            }

            .pad-top32 {
                padding-top: 32px !important;
            }

            .height10 {
                height: 10px !important;
            }

            .mob-80 {
                width: 80px !important;
                height: auto !important;
            }

            .pad-top10 {
                padding-top: 10px !important;
            }

            .border-btm {
                border-bottom: 1px solid #B6BEC9 !important;
                border-right: 0px solid #B6BEC9 !important;
            }

            img.mob-widd {
                width: 104px !important;
            }

            .font-24 {
                font-size: 24px !important;
                line-height: 30px !important;
            }

            table.logos2-width {
                width: 250px !important;
                min-width: 250px !important;
            }

            .logos1-width {
                width: 340px !important;
                min-width: 340px !important;
            }

            .pd-lft {
                padding-left: 8px;
            }


        }

        @media only screen and (max-width: 425px) {
            img.mob-widd-d {
                width: 88px !important;

            }
        }
    </style> 
</head> 
<body style="margin-bottom: 0; -webkit-text-size-adjust: 100%; padding-bottom: 0;  margin-top: 0; margin-right: 0; -ms-text-size-adjust: 100%; margin-left: 0; padding-top: 0; padding-right: 0; padding-left: 0; width: 100%;"><style type="text/css">div#emailPreHeader{ display: none !important; }</style><div id="emailPreHeader" style="mso-hide:all; visibility:hidden; opacity:0; color:transparent; mso-line-height-rule:exactly; line-height:0; font-size:0px; overflow:hidden; border-width:0; display:none !important;">Unmigrated partners will lose access to the legacy Partner Central on October 1.</div> 
<!-- OUTER TABLE STARTS --> 
<table class="full-wrap" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-spacing: 0; border-collapse: collapse;margin:0 auto;"> 
<tbody>
<tr> 
<!-- Email Body BG Color define --> 
<td class="darkMode" bgcolor="#ffffff" style="background-color:#ffffff"> 
<!-- outer width define in this table --> 
<table class="main mktoContainer" id="template-wrapper" cellpadding="0" cellspacing="0" align="center" border="0" width="680" style="border-collapse:collapse; margin:0 auto; width:680px; min-width:680px;">
<tr class="mktoModule" id="module012fd6c6b0-eb81-4ae2-9f14-66aad52adff0"> 
<td> 
<table class="main" width="680" cellpadding="0" cellspacing="0" style="border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;margin:0 auto;width: 680px;" border="0" align="center"> 
<tbody> 
<tr> 
<td class="lightMode1" background="https://pages.awscloud.com/rs/112-TZM-766/images/IImg-Gradient_C.jpg" bgcolor="#ffffff" border="0" style="background-image:  url(''https://pages.awscloud.com/rs/112-TZM-766/images/IImg-Gradient_C.jpg'');background-repeat:no-repeat;background-position:top;background-size: contain;background-color:#ffffff;"> 
<!--[if gte mso 9]>
                                    <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:680px;display:block;height:78px;">
                                       <v:fill type="frame"  src="https://pages.awscloud.com/rs/112-TZM-766/images/IImg-Gradient_C.jpg" color="#ffffff" />
                                       <v:textbox inset="0,0,0,0">
                                          <![endif]--> 
<table class="main" width="680" align="center" border="0" cellpadding="0" cellspacing="0" style="width:680px; margin:0 auto; border-spacing: 0;"> 
<tbody> 
<tr> 
<td height="24" style="line-height:1px;font-size:1px;">&nbsp; </td> 
</tr> 
<tr> 
<td align="center" style="text-align: center; width: 50px;"> 
<div> 
<a href=
"http://partnermail.awscloud.com/dc/KwqiTCOQ16Q1JCi3MdelD8NAAKOgAMmC9OjIqnaB10nu35GXAi7UyhNDOn3Zjg-kHiqJbkTdu6pt-4c_PL7EpGaeYAJk9eWk8lbFnlU2UagHO4XoMTUydURU6tsPs-etndon-GB8VsHMS0_uNantyNF4bBDqkVcW9YO35fFGzcARckGo-MrUxQnTNVIsPu-6OP9vk-gVwkFtO0Grr23LCHqKM0Jgu8RV8E2ql8skaIs3OjUAovlYEdJTlSCCT9G_tQmAzhlMDpgSsatuVzGeSN46PoJZ8F3jIUZ2hdR5bENg2GoCYj6ReE8q23NjCS64xbVlDuZ0mq5Gs64SbJTnbw==/MzAyLUNKSi03NDYAAAGkABxmYFeJpkNtiIIoNiYOy36KjnYbKx2GXdKvjtdUT1ppP4w_c_8nu4wuy5jmsc-Ltby6nzo=" target="_blank"
> <img src="https://pages.awscloud.com/rs/112-TZM-766/images/AWS_logo_RGB_BLK 1-dark.png" width="50" border="0" alt="AWS Logo" /> </a> 
</div> </td> 
</tr> 
<tr> 
<td height="24" style="line-height:1px;font-size:1px;">&nbsp; </td> 
</tr> 
</tbody> 
</table> 
<!--[if gte mso 9]>
                                       </v:textbox>
                                    </v:rect>
                                    <![endif]--> </td> 
</tr> 
<tr> 
<td class="lightMode" bgcolor="#ffffff" style="background-color: #ffffff;"> 
<table class="deviceWidth1" width="600" align="center" border="0" cellpadding="0" cellspacing="0" style="width:600px; margin:0 auto; border-spacing: 0;"> 
<tbody> 
<tr> 
<td class="dark center font-24" style="text-align: center;font-family: ''AmazonEmber'', Helvetica, arial, sans-serif; font-size:36px; line-height:44px; color: #161D26; mso-line-height-rule:exactly;font-weight: bold;"> 
<div> 
</div> </td> 
</tr> 
</tbody> 
</table> </td> 
</tr> 
<tr> 
<td class="lightMode" bgcolor="#ffffff" height="40" style="background-color: #ffffff;line-height:1px;font-size:1px;">&nbsp;</td> 
</tr> 
</tbody> 
</table> </td> 
</tr>
<tr class="mktoModule" id="module-038ffec19e-cae3-4bfd-bc4a-9704e2f1d8b6"> 
<td> 
<table width="100%" cellpadding="0" cellspacing="0" style="border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; margin:0 auto;width:100%;" border="0" align="center"> 
<tbody> 
<tr> 
<td class="lightMode" style="background-color:#ffffff;" bgcolor="#ffffff"> 
<table class="deviceWidth1" width="600" cellpadding="0" cellspacing="0" style="border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; margin:0 auto;width:600px;" border="0" align="center"> 
<tbody> 
<tr> 
<td height="0" style="line-height:0px;font-size:0px;"></td> 
</tr> 
<tr> 
<td class="dark" valign="top" style="font-family:AmazonEmber,arial, Helvetica, sans-serif; font-size:16px;line-height:24px; font-weight:normal; color:#232B37; text-align: left; mso-line-height-rule: exactly;"> 
<div class="mktoText" id="mod03-texte4be40b5-387d-4af7-ba06-239d0c331e8e"> 
<p><em>If you have already migrated to the new AWS Partner Central experience, please ignore this reminder.</em></p> 
<p><strong>This is an urgent reminder: you have 30 days remaining to migrate to the new Partner Central experience. The deadline is September 30, 2026.</strong></p> 
<p>Effective October 1, partners who have not yet migrated to the new Partner Central experience will lose access to nearly all functionality in Partner Central, including submitting fund requests, managing claims, and creating or progressing opportunities. No data is lost, and all functionality (including in-progress workflows) resumes immediately upon completing migration. See <a href=
"http://partnermail.awscloud.com/MzAyLUNKSi03NDYAAAGkABxmYHpasdNShWIL4M4lMeki-NkUMmivafYzxz_Xw0DaO-a7J3DROfpjK-ZYoncvWJ8dPDA=" target="_blank" id=""
>FAQ</a> for details.</p> 
<p>Take action today</p> 
<ol> 
<li><a href=
"https://partnercentral.awspartner.com/partnercentral2/s/login" target="_blank" class=" mktNoTrack"
>Log in to Partner Central</a> with your company email and password.</li> 
<li>Follow the migration wizard to complete your migration steps.</li> 
<li>Coordinate with your IAM Administrator to ensure user access is set up correctly.<br /></li> 
</ol> 
<p>Need migration support? <a href=
"https://aws.amazon.com/partners/partner-central/#need-partner-central-migration-support" target="_blank" id="" class=" mktNoTrack"
>Explore professional services</a> from AWS Partners to help.</p> 
<p><strong>Resources</strong></p> 
<ul> 
<li>Read the migration <a href=
"http://partnermail.awscloud.com/MzAyLUNKSi03NDYAAAGkABxmYF9x1igLUcvR2gFC_aK6b2D9ohe_OdprgjTKuj5zPGsSY7L9DfMAGi6fBKAPVOtozgY=" target="_blank" id=""
>FAQ</a> and Watch the <a href=
"http://partnermail.awscloud.com/MzAyLUNKSi03NDYAAAGkABxmYBSMl-cxiEFD6mjRh3RMIM0AMEciVm-vJ7xz780VPc0gCX1OkEqJJEQvu9Cf9KFzZVg=" target="_blank" id=""
>migration demo</a></li> 
<li><a href=
"https://www.linkedin.com/groups/16098241/" target="_blank" class=" mktNoTrack"
>Join our LinkedIn community</a></li> 
</ul> 
</div> </td> 
</tr> 
<tr> 
<td height="40" style="line-height:1px;font-size:1px;">&nbsp; </td> 
</tr> 
</tbody> 
</table> </td> 
</tr> 
</tbody> 
</table> </td> 
</tr>
<tr class="mktoModule" id="module-12"> 
<td> 
<table cellpadding="0" cellspacing="0" align="center" border="0" width="100%" style="margin:0 auto; min-width:100%;"> 
<tbody> 
<tr> 
<td class="lightMode" bgcolor="#ffffff" style="background-color: #ffffff;"> 
<table class="deviceWidth1" width="600" cellpadding="0" cellspacing="0" style="border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; margin:0 auto;width:600px;" border="0" align="center"> 
<tbody> 
<tr> 
<td height="16" style="font-size: 1px; line-height: 1px;">&nbsp; </td> 
</tr> 
<tr> 
<td class="" style="vertical-align:top;color:#888888;font-size: 14px;line-height: 20px;text-align:left;font-family:''AmazonEmber'',arial,helvetica;font-weight:normal;"> 
<table width="100%" cellspacing="0" cellpadding="0" border="0"> 
<tbody> 
<tr> 
<td class="dark2"> 
<div class="mktoSnippet" id="footersnippet1">
<div class="mktEditable" id="Footer"> 
<table style="max-width: 600px;" class="responsive-table" width="100%" cellspacing="0" cellpadding="0" border="0" align="center"> 
<tbody> 
<tr> 
<td class="âfont-family-decorâ" style="font-size: 12px; line-height: 18px; color: #666666;" align="center"> 
<dl> 
<dt style="color: #666666; font-size: 10px; text-align: center;">
Amazon Web Services, Inc. is a subsidiary of Amazon.com, Inc. Amazon.com is a registered trademark of Amazon.com.
</dt> 
<dt style="color: #666666; font-size: 10px; text-align: center;">
This message was produced and distributed by Amazon Web Services, Inc. or its 
<a class="mktNoTrack" href=
"https://aws.amazon.com/legal/marketingentities/" style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; color: #007eb9; font-size: 10px; text-decoration: none;"
>affiliates</a>, 410 Terry Ave. North, Seattle, WA 98109.
</dt> 
<dt style="color: #666666; font-size: 10px; text-align: center;">
Â© 2026, Amazon Web Services, Inc. or its affiliates. All rights reserved. Read our 
<a class="mktNoTrack" href=
"https://aws.amazon.com/privacy/" style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; color: #007eb9; font-size: 10px; text-decoration: none;"
>Privacy Notice</a>.
</dt> 
</dl> </td> 
</tr> 
</tbody> 
</table> 
</div>
</div> </td> 
</tr> 
<tr> 
<td height="15" style="font-size: 1px; line-height: 1px;"> &nbsp;</td> 
</tr> 
<tr> 
<td class="dark2"> 
<div class="mktoSnippet" id="footersnippet2"></div> </td> 
</tr> 
<tr> 
<td height="15" style="font-size: 1px; line-height: 1px;"> &nbsp;</td> 
</tr> 
<tr> 
<td class="dark2"> 
<div class="mktoSnippet" id="footersnippet3"></div> </td> 
</tr> 
</tbody> 
</table> </td> 
</tr> 
<tr> 
<td height="20" style="font-size: 1px; line-height: 1px;">&nbsp; </td> 
</tr> 
</tbody> 
</table> </td> 
</tr> 
</tbody> 
</table> </td> 
</tr>
</table> </td> 
</tr> 
</tbody>
</table>  
<a href=
"http://partnermail.awscloud.com/MzAyLUNKSi03NDYAAAGkABxmYCsc3krAqvz46BW3nAWvoIRqJ2CuoTVbHvDnG5nZRoLfR9X3y4JNIz5byWRHJJJbMP4="
></a>
<img src="http://partnermail.awscloud.com/trk?t=1&mid=MzAyLUNKSi03NDYAAAGkABxmYJlXanSJvOUM0nAm4jtdfRLDCGsyHCkX6h42Y3dtYX-FACae3jedMtjBbqmS7lVPiqQBdU98aHbza5_WFytDkXERx08KQZfpYkpt2SWVRajf1sO4bv8Fgc6IQHoKi4y36tlwodTAlBc2nOE" width="1" height="1" style="display:none !important;" alt="" />
</body>
</html>
', 'If you have already migrated to the new AWS Partner Central experience, please ignore this reminder This is an urgent reminder: you have 30 days remaining to migrate to the new Partner Central experie...', 1, 0, 0, 0, 0, 0, 26979, 'inbound', 'received', '2026-09-02 08:02:07', NULL, '2026-09-02 08:02:07', '2026-09-02 08:02:07', NULL);
INSERT INTO emails (id, user_id, message_id, thread_id, in_reply_to, ref_header, from_address, from_name, to_address, cc_address, bcc_address, reply_to, subject, text, html, snippet, folder_id, is_read, is_starred, is_important, is_draft, has_attachments, size, direction, status, received_at, sent_at, created_at, updated_at, snooze_until) VALUES (6, 1, '<CACJVN-yhoHLS_wR_-5VeTaPOJSKKTerAa8mvX-yC9BZMcz_jow@mail.gmail.com>', 'thread-confirmation-ikechukwu.anyanwu@syscomptech.ng', NULL, NULL, 'ikechukwu.anyanwu@syscomptech.ng', 'Ikechukwu Anyanwu', 'akoma@kreatixtech.com', NULL, NULL, NULL, 'Confirmation', 'Dear PK

Checking the email

kindly reply me via this email

-- 
Redemption Ikechukwu Anyanwu
NOC
Syscomptech Communications Ltd
B7 Obanta Close, Off Ajao Road.
Ikeja, Lagos, Nigeria.

+234 8038896064

', '<div dir="ltr"><div>Dear PK</div><div><br></div><div>Checking the emailÂ </div><div><br></div><div>kindly reply me via thisÂ email</div><div><br></div><span class="gmail_signature_prefix">-- </span><br><div dir="ltr" class="gmail_signature" data-smartmail="gmail_signature"><div dir="ltr"><div><div dir="ltr"><div><div dir="ltr"><span>Redemption Ikechukwu Anyanwu<br>NOC<br>Syscomptech Communications Ltd<br><div style="font-size:12.8px" dir="ltr">B7 Obanta Close, Off AjaoÂ Road.Â </div><div style="font-size:12.8px" dir="ltr">Ikeja, Lagos, Nigeria. <br><br>+234 8038896064</div></span><div style="font-size:12.8px" dir="ltr"></div></div></div></div></div></div></div></div>

', 'Dear PK Checking the email kindly reply me via this email -- Redemption Ikechukwu Anyanwu NOC Syscomptech Communications Ltd B7 Obanta Close, Off Ajao Road. Ikeja, Lagos, Nigeria. +234 8038896064', 1, 1, 0, 0, 0, 0, 879, 'inbound', 'received', '2026-09-02 09:12:12', NULL, '2026-09-02 09:12:12', '2026-09-02 09:15:50', NULL);
INSERT INTO emails (id, user_id, message_id, thread_id, in_reply_to, ref_header, from_address, from_name, to_address, cc_address, bcc_address, reply_to, subject, text, html, snippet, folder_id, is_read, is_starred, is_important, is_draft, has_attachments, size, direction, status, received_at, sent_at, created_at, updated_at, snooze_until) VALUES (7, 1, '0e401a12-5927-4bf6-b420-a346d8e7795d', 6, NULL, NULL, 'akoma@kreatixtech.com', 'Akoma', 'ikechukwu.anyanwu@syscomptech.ng', NULL, NULL, NULL, 'Re: Confirmation', 'Message seen


On 2026-09-02 09:12:12, Ikechukwu Anyanwu wrote:


Dear PK


Checking the emailÂ 


kindly reply me via thisÂ email


--

Redemption Ikechukwu Anyanwu
NOC
Syscomptech Communications Ltd

B7 Obanta Close, Off AjaoÂ Road.Â 
Ikeja, Lagos, Nigeria.

+234 8038896064', 'Message seen<br><br><blockquote style="border-left:2px solid #E8E5E0;padding-left:12px;margin:0;color:#6B6F76;font-size:13px;">On 2026-09-02 09:12:12, Ikechukwu Anyanwu wrote:<br><br><div dir="ltr"><div>Dear PK</div><div><br></div><div>Checking the email&nbsp;</div><div><br></div><div>kindly reply me via this&nbsp;email</div><div><br></div><span class="gmail_signature_prefix">-- </span><br><div dir="ltr" class="gmail_signature" data-smartmail="gmail_signature"><div dir="ltr"><div><div dir="ltr"><div><div dir="ltr"><span>Redemption Ikechukwu Anyanwu<br>NOC<br>Syscomptech Communications Ltd<br><div style="font-size:12.8px" dir="ltr">B7 Obanta Close, Off Ajao&nbsp;Road.&nbsp;</div><div style="font-size:12.8px" dir="ltr">Ikeja, Lagos, Nigeria. <br><br>+234 8038896064</div></span><div style="font-size:12.8px" dir="ltr"></div></div></div></div></div></div></div></div>

</blockquote>', 'Message seen On 2026-09-02 09:12:12, Ikechukwu Anyanwu wrote: Dear PK Checking the email kindly reply me via this email -- Redemption Ikechukwu Anyanwu NOC Syscomptech Communications Ltd B7 Obanta Clo...', 3, 1, 0, 0, 0, 0, 276, 'outbound', 'sent', '2026-09-02 09:16:08', '2026-09-02 09:16:08', '2026-09-02 09:16:08', '2026-09-02 09:16:08', NULL);
INSERT INTO emails (id, user_id, message_id, thread_id, in_reply_to, ref_header, from_address, from_name, to_address, cc_address, bcc_address, reply_to, subject, text, html, snippet, folder_id, is_read, is_starred, is_important, is_draft, has_attachments, size, direction, status, received_at, sent_at, created_at, updated_at, snooze_until) VALUES (8, 1, '415833e7-4a24-4c02-ad58-6b7b2dd02991', 4, NULL, NULL, 'akoma@kreatixtech.com', 'Akoma', 'John.Moses@whytelabeltech.com', 'saheed.otusajo@canarypointholding.com,wisdom.ibanga@whytelabeltech.com,abayomi.olufemi@whytelabeltech.com,emmanuel.bassey@assetsmfb.com,office.md@assetsmfb.com,praise.sanusi@assetsmfb.com,yakubu.johntela@assetsmfb.com', 'onyedika.akoma@gmail.com', NULL, 'Re: Vulnerability Assessment and Penetration Test (VAPT) - Vendor Engagement', 'Hello John.Â 
Find attached the invoice for the project along with the action plan with timeline.Â 
We look forward to getting started on the project. Our team is ready to begin.


Regards


On 2026-09-02 06:57:29, John Moses wrote:


Dear Okoma,


Top of the morning to you.


As disscused, kindly share an invoice that contains a means of mobilization payment.


Warm regards,
From: John Moses <John.Moses@whytelabeltech.com>
Sent: Monday, August 31, 2026 6:52 PM
To: Emmanuel Bassey <emmanuel.bassey@assetsmfb.com>; Office of the MD <office.md@assetsmfb.com>; Praise Sanusi <praise.sanusi@assetsmfb.com>
Cc: Saheed Otusajo <saheed.otusajo@canarypointholding.com>; Wisdom Ibanga <wisdom.ibanga@whytelabeltech.com>; Abayomi Olufemi <abayomi.olufemi@whytelabeltech.com>
Subject: Re: Vulnerability Assessment and Penetration Test (VAPT) - Vendor Engagement
Â 
Dear MD,


Thanks for you support.


I will reach out to the vendor to commence implementation.


Warm regards.


Get Outlook for iOS
From: Emmanuel Bassey <emmanuel.bassey@assetsmfb.com>
Sent: Monday, 31 August 2026 16:05:40
To: John Moses <John.Moses@whytelabeltech.com>; Office of the MD <office.md@assetsmfb.com>; Praise Sanusi <praise.sanusi@assetsmfb.com>
Cc: Saheed Otusajo <saheed.otusajo@canarypointholding.com>; Wisdom Ibanga <wisdom.ibanga@whytelabeltech.com>; Abayomi Olufemi <abayomi.olufemi@whytelabeltech.com>
Subject: Re: Vulnerability Assessment and Penetration Test (VAPT) - Vendor Engagement
Â 
Thanks John,


This is approved.




From: John Moses <John.Moses@whytelabeltech.com>
Sent: Monday, August 31, 2026 9:13 AM
To: Office of the MD <office.md@assetsmfb.com>; Praise Sanusi <praise.sanusi@assetsmfb.com>
Cc: Saheed Otusajo <saheed.otusajo@canarypointholding.com>; Wisdom Ibanga <wisdom.ibanga@whytelabeltech.com>; Abayomi Olufemi <abayomi.olufemi@whytelabeltech.com>; Emmanuel Bassey <emmanuel.bassey@assetsmfb.com>
Subject: Re: Vulnerability Assessment and Penetration Test (VAPT) - Vendor Engagement


Dear Praise,


As discussed.


I am bumping this to the top of you mail.


Warm regards,


From: John Moses <John.Moses@whytelabeltech.com>
Sent: Monday, August 17, 2026 11:36 AM
To: Emmanuel Bassey <emmanuel.bassey@assetsmfb.com>; Office of the MD <office.md@assetsmfb.com>
Cc: Saheed Otusajo <saheed.otusajo@canarypointholding.com>; Wisdom Ibanga <wisdom.ibanga@whytelabeltech.com>; Abayomi Olufemi <abayomi.olufemi@whytelabeltech.com>
Subject: Re: Vulnerability Assessment and Penetration Test (VAPT) - Vendor Engagement
Â 
Dear MD,
I am writing to follow up on the outstanding approval for this activity.
The timely execution of the independent VAPT assessment is critical, as it is currently a dependency for some of our ongoing third-party vendor integrations. The vendors have specifically requested evidence of an independent security assessment before proceeding with the integrations.
Kindly assist with the necessary approval to proceed with the engagement of the vendor and avoid further delays to the ongoing integrations.
Warm regards,
From: John Moses <John.Moses@whytelabeltech.com>
Sent: Thursday, July 30, 2026 1:46 PM
To: Emmanuel Bassey <emmanuel.bassey@assetsmfb.com>; Office of the MD <office.md@assetsmfb.com>
Cc: Saheed Otusajo <saheed.otusajo@canarypointholding.com>; Wisdom Ibanga <wisdom.ibanga@whytelabeltech.com>; Abayomi Olufemi <abayomi.olufemi@whytelabeltech.com>
Subject: Re: Vulnerability Assessment and Penetration Test (VAPT)
Â 
Dear MD,
Following your previous approval to engage Vendors to help with our Annual Independent VAPT.
I would like to seek your approval for the attached Vulnerability Assessment and Penetration Testing (VAPT) engagement proposal from Kreatix Technologies for our organization''s infrastructure.
The engagement will cover both External and Internal Network VAPT, including our public-facing applications, APIs, servers, network infrastructure, firewalls, VPNs, wireless environment, and overall security architecture.
The assessment is designed to independently validate our security posture through controlled penetration testing and provide both Executive and Technical reports with remediation recommendations. The engagement is expected to be completed within 15 business days, with a total project cost of â¦2,365,000 (inclusive of VAT). A 70% Down payment is required to commence without delay.
This engagement is important for the following reasons:

Regulatory Compliance: It supports our compliance obligations under the Central Bank of Nigeria (CBN) Cybersecurity Framework and the Nigeria Data Protection Act (NDPA), both of which require periodic independent security assessments of critical systems.

Independent Security Assurance: It provides an independent review of our security controls to identify vulnerabilities before they can be exploited, ensuring management has an objective assessment of our cyber risk posture.

NPS Integration Requirement: Completion of an independent VAPT is a mandatory prerequisite for our NPS integration. At present, this assessment is a critical blocker, and the integration cannot proceed until the VAPT has been successfully completed and the findings addressed where necessary.

Given the regulatory significance and our dependence on the NPS integration timeline, I kindly request your approval to proceed with this engagement so we can commence the assessment without delay.

Warm regards,
From: akoma@kreatixtech.com <akoma@kreatixtech.com>
Sent: Wednesday, July 29, 2026 6:58 PM
To: John Moses <john.moses@whytelabeltech.com>
Cc: Saheed Otusajo <saheed.otusajo@canarypointholding.com>; Wisdom Ibanga <wisdom.ibanga@whytelabeltech.com>; Emmanuel Bassey <emmanuel.bassey@assetsmfb.com>
Subject: Vulnerability Assessment and Penetration Test (VAPT)
Â 
â  WARNING: THIS EMAIL ORIGINATED FROM AN EXTERNAL SOURCE. DO NOT CLICK LINKS OR OPEN ATTACHMENTS UNLESS YOU RECOGNIZE THE SENDER AND KNOW THE CONTENT IS SAFE.
Hello John.Â 


Thanks for reaching out. With regard to the VAPT exercise, find attached our proposal in view of your stated scope.Â 


We took due consideration of our commitment to keep you as our clients and gave you our best price.Â 


We are keen to work with you to ensure you have a greater security profile for your applications.




Onyedikachi Akoma
Business Head
+234 7039612627
akoma@kreatixtech.com
https://kreatixtech.com



Best regards,


John Moses


Lead Information Security Officer


Assets Microfinance Bank


ðÂ Â  17A, Dele Adedeji Street, Off Bisola Durosimi-Etti Street, Lekki Phase 1


ðÂ Â 


âï¸Â Â  John.Moses@whytelabeltech.com


ðÂ Â  https://www.assetsmfb.com/





Best regards,


Emmanuel M Bassey


MD/CEO


Assets Microfinance Bank


ðÂ Â  17A, Dele Adedeji Street, Off Bisola Durosimi-Etti Street, Lekki Phase 1


ðÂ Â  07047649155


âï¸Â Â  emmanuel.bassey@assetsmfb.com


ðÂ Â  https://www.assetsmfb.com/


This email (including attachments) contains information which may be confidential and legally privileged unless the content clearly indicates otherwise, it is intended solely for the use of the individual or entity to whom it is addressed. Unless you are the intended recipient, you may not use, copy or disclose to anyone the message or any information contained in the message or from any attachments that were sent with this email, and if you have received this email message in error, please notify the sender by email, and delete the message. Any use, dissemination, distribution, or reproduction of this message by unintended recipients is not authorised. Caution should be observed in placing any reliance upon any information contained in this e-mail, which is not intended to be a representation to make any decision and any decision taken based on the information provided in this e-mail, should only be made after consultation with appropriate legal, regulatory, technical, financial, and accounting advisors. Assets MFB accepts no responsibility whatsoever for any loss, direct, indirect or consequential, arising from information made available and actions resulting there from. For more information about Asset Microfinance Bank, please visit us at www.assetsmfb.com



Best regards,
John Moses
Lead Information Security Officer
Assets Microfinance Bank
ðÂ Â  17A, Dele Adedeji Street, Off Bisola Durosimi-Etti Street, Lekki Phase 1
ðÂ Â 
âï¸Â Â  John.Moses@whytelabeltech.com
ðÂ Â  https://www.assetsmfb.com/
', 'Hello John.&nbsp;<div>Find attached the invoice for the project along with the action plan with timeline.&nbsp;</div><div>We look forward to getting started on the project. Our team is ready to begin.</div><div><br></div><div>Regards<br><br><blockquote style="border-left:2px solid #E8E5E0;padding-left:12px;margin:0;color:#6B6F76;font-size:13px;">On 2026-09-02 06:57:29, John Moses wrote:<br><br>

<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<style type="text/css" style="display:none;"> P {margin-top:0;margin-bottom:0;} </style>


<div class="elementToProof" style="font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Dear Okoma,</div>
<div class="elementToProof" style="font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<div class="elementToProof" style="font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Top of the morning to you.</div>
<div class="elementToProof" style="font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<div class="elementToProof" style="font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
As disscused, kindly share an invoice that contains a means of mobilization payment.</div>
<div class="elementToProof" style="font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<div class="elementToProof" style="font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Warm regards,</div>
<hr style="display: inline-block; width: 98%;">
<div id="divRplyFwdMsg">
<div style="direction: ltr; font-family: Calibri, sans-serif; font-size: 11pt; color: rgb(0, 0, 0);">
<b>From:</b> John Moses &lt;John.Moses@whytelabeltech.com&gt;<br>
<b>Sent:</b> Monday, August 31, 2026 6:52 PM<br>
<b>To:</b> Emmanuel Bassey &lt;emmanuel.bassey@assetsmfb.com&gt;; Office of the MD &lt;office.md@assetsmfb.com&gt;; Praise Sanusi &lt;praise.sanusi@assetsmfb.com&gt;<br>
<b>Cc:</b> Saheed Otusajo &lt;saheed.otusajo@canarypointholding.com&gt;; Wisdom Ibanga &lt;wisdom.ibanga@whytelabeltech.com&gt;; Abayomi Olufemi &lt;abayomi.olufemi@whytelabeltech.com&gt;<br>
<b>Subject:</b> Re: Vulnerability Assessment and Penetration Test (VAPT) - Vendor Engagement</div>
<div style="direction: ltr;">&nbsp;</div>
</div>
<div style="direction: ltr; font-family: Aptos, Aptos_MSFontService, -apple-system, Roboto, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Dear MD,</div>
<div style="direction: ltr; font-family: Aptos, Aptos_MSFontService, -apple-system, Roboto, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<div style="direction: ltr; font-family: Aptos, Aptos_MSFontService, -apple-system, Roboto, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Thanks for you support.</div>
<div style="direction: ltr; font-family: Aptos, Aptos_MSFontService, -apple-system, Roboto, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<div style="direction: ltr; font-family: Aptos, Aptos_MSFontService, -apple-system, Roboto, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
I will reach out to the vendor to commence implementation.</div>
<div style="direction: ltr; font-family: Aptos, Aptos_MSFontService, -apple-system, Roboto, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<div style="direction: ltr; font-family: Aptos, Aptos_MSFontService, -apple-system, Roboto, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Warm regards.</div>
<div id="x_ms-outlook-mobile-body-separator-line">
<div style="direction: ltr; font-family: Aptos, Aptos_MSFontService, -apple-system, Roboto, Arial, Helvetica, sans-serif; font-size: 12pt;">
<br>
</div>
</div>
<div id="x_ms-outlook-mobile-signature">
<div style="direction: ltr; font-family: Aptos, Aptos_MSFontService, -apple-system, Roboto, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Get <a href="https://aka.ms/o0ukef" id="OWA93542c01-ff1a-aee0-7275-00f70d581b74" class="OWAAutoLink" data-auth="NotApplicable">
Outlook for iOS</a></div>
</div>
<hr style="display: inline-block; width: 98%;">
<div id="x_divRplyFwdMsg">
<div style="direction: ltr; font-family: Calibri, sans-serif; font-size: 11pt; color: rgb(0, 0, 0);">
<b>From:</b> Emmanuel Bassey &lt;emmanuel.bassey@assetsmfb.com&gt;<br>
<b>Sent:</b> Monday, 31 August 2026 16:05:40<br>
<b>To:</b> John Moses &lt;John.Moses@whytelabeltech.com&gt;; Office of the MD &lt;office.md@assetsmfb.com&gt;; Praise Sanusi &lt;praise.sanusi@assetsmfb.com&gt;<br>
<b>Cc:</b> Saheed Otusajo &lt;saheed.otusajo@canarypointholding.com&gt;; Wisdom Ibanga &lt;wisdom.ibanga@whytelabeltech.com&gt;; Abayomi Olufemi &lt;abayomi.olufemi@whytelabeltech.com&gt;<br>
<b>Subject:</b> Re: Vulnerability Assessment and Penetration Test (VAPT) - Vendor Engagement</div>
<div style="direction: ltr;">&nbsp;</div>
</div>
<div style="direction: ltr; font-family: &quot;Product Sans&quot;; font-size: 10pt; color: rgb(0, 0, 0);">
Thanks John,</div>
<div style="direction: ltr; font-family: &quot;Product Sans&quot;; font-size: 10pt; color: rgb(0, 0, 0);">
<br>
</div>
<div style="direction: ltr; font-family: &quot;Product Sans&quot;; font-size: 10pt; color: rgb(0, 0, 0);">
This is approved.</div>
<div style="direction: ltr;"><br>
</div>
<div style="direction: ltr; font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<hr style="direction: ltr; display: inline-block; width: 98%;">
<div style="direction: ltr; font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<b>From:</b> John Moses &lt;John.Moses@whytelabeltech.com&gt;<br>
<b>Sent:</b> Monday, August 31, 2026 9:13 AM<br>
<b>To:</b> Office of the MD &lt;office.md@assetsmfb.com&gt;; Praise Sanusi &lt;praise.sanusi@assetsmfb.com&gt;<br>
<b>Cc:</b> Saheed Otusajo &lt;saheed.otusajo@canarypointholding.com&gt;; Wisdom Ibanga &lt;wisdom.ibanga@whytelabeltech.com&gt;; Abayomi Olufemi &lt;abayomi.olufemi@whytelabeltech.com&gt;; Emmanuel Bassey &lt;emmanuel.bassey@assetsmfb.com&gt;<br>
<b>Subject:</b> Re: Vulnerability Assessment and Penetration Test (VAPT) - Vendor Engagement</div>
<div style="direction: ltr; font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Dear Praise,</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
As discussed.</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
I am bumping this to the top of you mail.</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Warm regards,</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<hr style="direction: ltr; display: inline-block; width: 98%;">
<div id="x_x_x_divRplyFwdMsg">
<div style="direction: ltr; font-family: Calibri, sans-serif; font-size: 11pt; color: rgb(0, 0, 0);">
<b>From:</b> John Moses &lt;John.Moses@whytelabeltech.com&gt;<br>
<b>Sent:</b> Monday, August 17, 2026 11:36 AM<br>
<b>To:</b> Emmanuel Bassey &lt;emmanuel.bassey@assetsmfb.com&gt;; Office of the MD &lt;office.md@assetsmfb.com&gt;<br>
<b>Cc:</b> Saheed Otusajo &lt;saheed.otusajo@canarypointholding.com&gt;; Wisdom Ibanga &lt;wisdom.ibanga@whytelabeltech.com&gt;; Abayomi Olufemi &lt;abayomi.olufemi@whytelabeltech.com&gt;<br>
<b>Subject:</b> Re: Vulnerability Assessment and Penetration Test (VAPT) - Vendor Engagement</div>
<div style="direction: ltr;">&nbsp;</div>
</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Dear MD,</div>
<div style="direction: ltr; margin-top: 1em; margin-bottom: 1em; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
I am writing to follow up on the outstanding approval for this activity.</div>
<div style="direction: ltr; margin-top: 1em; margin-bottom: 1em; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
The timely execution of the independent VAPT assessment is critical, as it is currently a dependency for some of our ongoing third-party vendor integrations. The vendors have specifically requested evidence of an independent security assessment before proceeding
 with the integrations.</div>
<div style="direction: ltr; margin-top: 1em; margin-bottom: 1em; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Kindly assist with the necessary approval to proceed with the engagement of the vendor and avoid further delays to the ongoing integrations.</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Warm regards,</div>
<hr style="direction: ltr; display: inline-block; width: 98%;">
<div id="x_x_x_x_divRplyFwdMsg">
<div style="direction: ltr; font-family: Calibri, sans-serif; font-size: 11pt; color: rgb(0, 0, 0);">
<b>From:</b> John Moses &lt;John.Moses@whytelabeltech.com&gt;<br>
<b>Sent:</b> Thursday, July 30, 2026 1:46 PM<br>
<b>To:</b> Emmanuel Bassey &lt;emmanuel.bassey@assetsmfb.com&gt;; Office of the MD &lt;office.md@assetsmfb.com&gt;<br>
<b>Cc:</b> Saheed Otusajo &lt;saheed.otusajo@canarypointholding.com&gt;; Wisdom Ibanga &lt;wisdom.ibanga@whytelabeltech.com&gt;; Abayomi Olufemi &lt;abayomi.olufemi@whytelabeltech.com&gt;<br>
<b>Subject:</b> Re: Vulnerability Assessment and Penetration Test (VAPT)</div>
<div style="direction: ltr;">&nbsp;</div>
</div>
<div style="direction: ltr; margin-top: 1em; margin-bottom: 1em; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Dear MD,</div>
<div style="direction: ltr; margin-top: 1em; margin-bottom: 1em; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Following your previous approval to engage Vendors to help with our Annual Independent VAPT.</div>
<div style="direction: ltr; margin-top: 1em; margin-bottom: 1em; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
I would like to seek your approval for the attached Vulnerability Assessment and Penetration Testing (VAPT) engagement proposal from Kreatix Technologies for our organization''s infrastructure.</div>
<div style="direction: ltr; margin-top: 1em; margin-bottom: 1em; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
The engagement will cover both <b>External and Internal Network VAPT</b>, including our public-facing applications, APIs, servers, network infrastructure, firewalls, VPNs, wireless environment, and overall security architecture.</div>
<div style="direction: ltr; margin-top: 1em; margin-bottom: 1em; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
The assessment is designed to independently validate our security posture through controlled penetration testing and provide both Executive and Technical reports with remediation recommendations. The engagement is expected to be completed within
<b>15 business days</b>, with a total project cost of <b>â¦2,365,000 (inclusive of VAT)</b>. A
<b>70%</b> Down payment is required to commence without delay.</div>
<div style="direction: ltr; margin-top: 1em; margin-bottom: 1em; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
This engagement is important for the following reasons:</div>
<ul data-start="1082" data-end="1887" style="direction: ltr;">
<li style="font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<p role="presentation" style="direction: ltr; margin-top: 12pt; margin-bottom: 0px;">
<b>Regulatory Compliance:</b> It supports our compliance obligations under the <b>
Central Bank of Nigeria (CBN) Cybersecurity Framework</b> and the <b>Nigeria Data Protection Act (NDPA)</b>, both of which require periodic independent security assessments of critical systems.</p>
</li><li style="font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<p role="presentation" style="direction: ltr; margin-top: 12pt; margin-bottom: 0px;">
<b>Independent Security Assurance:</b> It provides an independent review of our security controls to identify vulnerabilities before they can be exploited, ensuring management has an objective assessment of our cyber risk posture.</p>
</li><li style="font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<p role="presentation" style="direction: ltr; margin-top: 12pt; margin-bottom: 0px;">
<b>NPS Integration Requirement:</b> Completion of an independent VAPT is a <b>mandatory prerequisite for our NPS integration</b>. At present, this assessment is a
<b>critical blocker</b>, and the integration cannot proceed until the VAPT has been successfully completed and the findings addressed where necessary.</p>
</li></ul>
<p style="direction: ltr; margin-top: 12pt; margin-bottom: 1em; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Given the regulatory significance and our dependence on the NPS integration timeline, I kindly request your approval to proceed with this engagement so we can commence the assessment without delay.</p>
<div style="direction: ltr; margin-top: 1em; margin-bottom: 1em; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Warm regards,</div>
<hr style="direction: ltr; display: inline-block; width: 98%;">
<div id="x_x_x_x_x_divRplyFwdMsg">
<div style="direction: ltr; font-family: Calibri, sans-serif; font-size: 11pt; color: rgb(0, 0, 0);">
<b>From:</b> akoma@kreatixtech.com &lt;akoma@kreatixtech.com&gt;<br>
<b>Sent:</b> Wednesday, July 29, 2026 6:58 PM<br>
<b>To:</b> John Moses &lt;john.moses@whytelabeltech.com&gt;<br>
<b>Cc:</b> Saheed Otusajo &lt;saheed.otusajo@canarypointholding.com&gt;; Wisdom Ibanga &lt;wisdom.ibanga@whytelabeltech.com&gt;; Emmanuel Bassey &lt;emmanuel.bassey@assetsmfb.com&gt;<br>
<b>Subject:</b> Vulnerability Assessment and Penetration Test (VAPT)</div>
<div style="direction: ltr;">&nbsp;</div>
</div>
<div style="direction: ltr; background-color: rgb(255, 243, 205); padding: 10px; border-width: 2px; border-style: solid; border-color: red; color: rgb(133, 100, 4);">
<b>â  WARNING: THIS EMAIL ORIGINATED FROM AN EXTERNAL SOURCE. DO NOT CLICK LINKS OR OPEN ATTACHMENTS UNLESS YOU RECOGNIZE THE SENDER AND KNOW THE CONTENT IS SAFE.</b></div>
<div style="direction: ltr; text-align: left; text-indent: 0px; background-color: rgb(255, 255, 255); margin: 0px; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: black;">
Hello John.&nbsp;</div>
<div style="direction: ltr; text-align: left; text-indent: 0px; background-color: rgb(255, 255, 255); margin: 0px; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: black;">
<br>
</div>
<div style="direction: ltr; text-align: left; text-indent: 0px; background-color: rgb(255, 255, 255); margin: 0px; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: black;">
Thanks for reaching out. With regard to the VAPT exercise, find attached our proposal in view of your stated scope.&nbsp;</div>
<div style="direction: ltr; text-align: left; text-indent: 0px; background-color: rgb(255, 255, 255); margin: 0px; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: black;">
<br>
</div>
<div style="direction: ltr; text-align: left; text-indent: 0px; background-color: rgb(255, 255, 255); margin: 0px; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: black;">
We took due consideration of our commitment to keep you as our clients and gave you our best price.&nbsp;</div>
<div style="direction: ltr; text-align: left; text-indent: 0px; background-color: rgb(255, 255, 255); margin: 0px; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: black;">
<br>
</div>
<div style="direction: ltr; text-align: left; text-indent: 0px; background-color: rgb(255, 255, 255); margin: 0px; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: black;">
We are keen to work with you to ensure you have a greater security profile for your applications.</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<div id="x_x_x_x_x_x_Signature">
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<b>Onyedikachi Akoma</b></div>
<div style="direction: ltr; font-family: &quot;Ink Free&quot;; font-size: 12pt; color: rgb(0, 0, 0);">
<i>Business Head</i></div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
+234 7039612627</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
akoma@kreatixtech.com</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<span class="spanWithBackgroundColor" style="background-color: rgb(255, 255, 0);">https://kreatixtech.com</span></div>
</div>
<div style="direction: ltr;"><br>
<br>
</div>
<table cellspacing="0" cellpadding="0" border="0" style="direction: ltr; width: 600px; color: rgb(17, 24, 39);">
<tbody>
<tr>
<td style="direction: ltr; padding-bottom: 8px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif; font-size: 11pt; color: rgb(17, 24, 39);">
Best regards,</div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 3px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif; font-size: 14.5pt; color: rgb(11, 94, 215);">
<b>John Moses</b></div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 4px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif; font-size: 11.5pt; color: rgb(55, 65, 81);">
<b>Lead Information Security Officer</b></div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 10px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif; font-size: 10.8pt; color: rgb(17, 24, 39);">
<b>Assets Microfinance Bank</b></div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 4px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif;"><span style="font-size: 10.5pt; color: rgb(11, 94, 215);">ð</span><span style="font-size: 10.5pt; color: rgb(17, 24, 39);">&nbsp;&nbsp;
</span><span style="font-size: 10.2pt; color: rgb(17, 24, 39);">17A, Dele Adedeji Street, Off Bisola Durosimi-Etti Street, Lekki Phase 1</span></div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 4px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif; font-size: 10.5pt;">
<span style="color: rgb(11, 94, 215);">ð</span><span style="color: rgb(17, 24, 39);">&nbsp;&nbsp;</span></div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 4px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif;"><span style="font-size: 10.5pt; color: rgb(11, 94, 215);">âï¸</span><span style="font-size: 10.5pt; color: rgb(17, 24, 39);">&nbsp;&nbsp;
</span><span style="font-size: 10.2pt; color: rgb(30, 102, 245);"><a href="mailto:John.Moses@whytelabeltech.com" id="OWA0e3056d5-b73e-1bea-3ffd-f5a3f77954aa" class="x_x_OWAAutoLink" style="color: rgb(30, 102, 245);"><u>John.Moses@whytelabeltech.com</u></a></span></div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 14px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif;"><span style="font-size: 10.5pt; color: rgb(11, 94, 215);">ð</span><span style="font-size: 10.5pt; color: rgb(17, 24, 39);">&nbsp;&nbsp;
</span><span style="font-size: 10.2pt; color: rgb(30, 102, 245);"><a href="https://www.assetsmfb.com/" id="OWA5328a01b-e665-cdd3-3198-e00ff058f8b7" class="x_x_OWAAutoLink" originalsrc="https://www.assetsmfb.com/" data-auth="NotApplicable" style="color: rgb(30, 102, 245);"><u>https://www.assetsmfb.com/</u></a></span></div>
</td>
</tr>
<tr>
<td style="direction: ltr;"><span style="font-family: &quot;Segoe UI&quot;, Arial, sans-serif; font-size: 10.5pt; color: rgb(17, 24, 39);"><img alt="Assets Microfinance Bank" width="600" style="width: 600px; height: auto; max-width: 600px; display: block;" src="https://i.imghippo.com/files/qPra7700jIE.png"></span></td>
</tr>
</tbody>
</table>
<div style="direction: ltr;"><br>
<br>
</div>
<table cellspacing="0" cellpadding="0" border="0" style="direction: ltr; width: 600px; color: rgb(17, 24, 39);">
<tbody>
<tr>
<td style="direction: ltr; padding-bottom: 8px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif; font-size: 11pt; color: rgb(17, 24, 39);">
Best regards,</div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 3px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif; font-size: 14.5pt; color: rgb(11, 94, 215);">
<b>Emmanuel M Bassey</b></div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 4px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif; font-size: 11.5pt; color: rgb(55, 65, 81);">
<b>MD/CEO</b></div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 10px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif; font-size: 10.8pt; color: rgb(17, 24, 39);">
<b>Assets Microfinance Bank</b></div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 4px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif;"><span style="font-size: 10.5pt; color: rgb(11, 94, 215);">ð</span><span style="font-size: 10.5pt; color: rgb(17, 24, 39);">&nbsp;&nbsp;
</span><span style="font-size: 10.2pt; color: rgb(17, 24, 39);">17A, Dele Adedeji Street, Off Bisola Durosimi-Etti Street, Lekki Phase 1</span></div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 4px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif;"><span style="font-size: 10.5pt; color: rgb(11, 94, 215);">ð</span><span style="font-size: 10.5pt; color: rgb(17, 24, 39);">&nbsp;&nbsp;
</span><span style="font-size: 10.2pt; color: rgb(17, 24, 39);">07047649155</span></div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 4px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif;"><span style="font-size: 10.5pt; color: rgb(11, 94, 215);">âï¸</span><span style="font-size: 10.5pt; color: rgb(17, 24, 39);">&nbsp;&nbsp;
</span><span style="font-size: 10.2pt; color: rgb(30, 102, 245);"><a href="mailto:emmanuel.bassey@assetsmfb.com" id="OWA527c5fbb-52d7-009e-e17d-be87b5626494" class="OWAAutoLink" style="color: rgb(30, 102, 245);"><u>emmanuel.bassey@assetsmfb.com</u></a></span></div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 14px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif;"><span style="font-size: 10.5pt; color: rgb(11, 94, 215);">ð</span><span style="font-size: 10.5pt; color: rgb(17, 24, 39);">&nbsp;&nbsp;
</span><span style="font-size: 10.2pt; color: rgb(30, 102, 245);"><a href="https://www.assetsmfb.com/" id="OWA46d4fda0-bb2b-f9a4-3510-1f198c8ed300" class="OWAAutoLink" originalsrc="https://www.assetsmfb.com/" data-auth="NotApplicable" style="color: rgb(30, 102, 245);"><u>https://www.assetsmfb.com/</u></a></span></div>
</td>
</tr>
<tr>
<td style="direction: ltr;"><span style="font-family: &quot;Segoe UI&quot;, Arial, sans-serif; font-size: 10.5pt; color: rgb(17, 24, 39);"><img alt="Assets Microfinance Bank" width="600" style="width: 600px; height: auto; max-width: 600px; display: block;" src="https://i.imghippo.com/files/qPra7700jIE.png"></span></td>
</tr>
</tbody>
</table>
<div style="direction: ltr;">This email (including attachments) contains information which may be confidential and legally privileged unless the content clearly indicates otherwise, it is intended solely for the use of the individual or entity to whom it is
 addressed. Unless you are the intended recipient, you may not use, copy or disclose to anyone the message or any information contained in the message or from any attachments that were sent with this email, and if you have received this email message in error,
 please notify the sender by email, and delete the message. Any use, dissemination, distribution, or reproduction of this message by unintended recipients is not authorised. Caution should be observed in placing any reliance upon any information contained in
 this e-mail, which is not intended to be a representation to make any decision and any decision taken based on the information provided in this e-mail, should only be made after consultation with appropriate legal, regulatory, technical, financial, and accounting
 advisors. Assets MFB accepts no responsibility whatsoever for any loss, direct, indirect or consequential, arising from information made available and actions resulting there from. For more information about Asset Microfinance Bank, please visit us at www.assetsmfb.com</div>
<br>
<br>
<table cellpadding="0" cellspacing="0" border="0" width="600" style="font-family: Segoe UI, Arial, sans-serif; color:#111827; font-size:10.5pt;">
<!-- Best regards -->
<tbody>
<tr>
<td style="padding-bottom:8px;"><span style="font-size:11pt;">Best regards,</span>
</td>
</tr>
<!-- Name -->
<tr>
<td style="padding-bottom:3px;"><span style="font-size:14.5pt; font-weight:bold; color:#0B5ED7;">John Moses
</span></td>
</tr>
<!-- Job title (auto-collapses if empty) -->
<tr>
<td style="padding-bottom:4px;"><span style="font-size:11.5pt; font-weight:bold; color:#374151;">Lead Information Security Officer
</span></td>
</tr>
<!-- Company -->
<tr>
<td style="padding-bottom:10px;"><span style="font-size:10.8pt; font-weight:bold;">Assets Microfinance Bank
</span></td>
</tr>
<!-- Address (static, always shown) -->
<tr>
<td style="padding-bottom:4px;"><span style="color:#0B5ED7;">ð</span>&nbsp;&nbsp; <span style="font-size:10.2pt;">
17A, Dele Adedeji Street, Off Bisola Durosimi-Etti Street, Lekki Phase 1 </span></td>
</tr>
<!-- Phone (minimised if empty) -->
<tr>
<td style="padding-bottom:4px;"><span style="color:#0B5ED7;">ð</span>&nbsp;&nbsp; <span style="font-size:10.2pt;">
</span></td>
</tr>
<!-- Email (almost always present) -->
<tr>
<td style="padding-bottom:4px;"><span style="color:#0B5ED7;">âï¸</span>&nbsp;&nbsp; <span style="font-size:10.2pt;">
<a href="mailto:John.Moses@whytelabeltech.com" style="color:#1E66F5; text-decoration:underline;">John.Moses@whytelabeltech.com
</a></span></td>
</tr>
<!-- Website -->
<tr>
<td style="padding-bottom:14px;"><span style="color:#0B5ED7;">ð</span>&nbsp;&nbsp; <span style="font-size:10.2pt;">
<a href="https://www.assetsmfb.com/" style="color:#1E66F5; text-decoration:underline;">https://www.assetsmfb.com/
</a></span></td>
</tr>
<!-- Banner -->
<tr>
<td><img src="https://i.imghippo.com/files/qPra7700jIE.png" alt="Assets Microfinance Bank" width="600" style="display:block; border:0; max-width:600px; height:auto;">
</td>
</tr>
</tbody>
</table>


</blockquote></div>', 'Hello John. Find attached the invoice for the project along with the action plan with timeline. We look forward to getting started on the project. Our team is ready to begin. Regards On 2026-09-02 06:...', 3, 1, 0, 0, 0, 0, 8428, 'outbound', 'sent', '2026-09-02 09:26:18', '2026-09-02 09:26:18', '2026-09-02 09:26:18', '2026-09-02 09:26:18', NULL);
INSERT INTO emails (id, user_id, message_id, thread_id, in_reply_to, ref_header, from_address, from_name, to_address, cc_address, bcc_address, reply_to, subject, text, html, snippet, folder_id, is_read, is_starred, is_important, is_draft, has_attachments, size, direction, status, received_at, sent_at, created_at, updated_at, snooze_until) VALUES (9, 1, '85c550f7-c83f-481c-b762-c23927549dae', 'thread-test-upload-akoma@kreatixtech.com', NULL, NULL, 'akoma@kreatixtech.com', 'Akoma', 'onyedika.akoma@gmail.com', NULL, NULL, NULL, 'Test Upload', 'Testing upload flow', 'Testing upload flow', 'Testing upload flow', 3, 1, 0, 0, 0, 1, 175643, 'outbound', 'sent', '2026-09-02 10:30:22', '2026-09-02 10:30:22', '2026-09-02 10:30:22', '2026-09-02 10:30:22', NULL);
INSERT INTO emails (id, user_id, message_id, thread_id, in_reply_to, ref_header, from_address, from_name, to_address, cc_address, bcc_address, reply_to, subject, text, html, snippet, folder_id, is_read, is_starred, is_important, is_draft, has_attachments, size, direction, status, received_at, sent_at, created_at, updated_at, snooze_until) VALUES (10, 1, '14a48001-adca-43c4-8d40-dd5dd448d46e', 8, NULL, NULL, 'akoma@kreatixtech.com', 'Akoma', 'akoma@kreatixtech.com', 'saheed.otusajo@canarypointholding.com,wisdom.ibanga@whytelabeltech.com,abayomi.olufemi@whytelabeltech.com,emmanuel.bassey@assetsmfb.com,office.md@assetsmfb.com,praise.sanusi@assetsmfb.com,yakubu.johntela@assetsmfb.com', 'onyedika.akoma@gmail.com', NULL, 'Re: Vulnerability Assessment and Penetration Test (VAPT) - Vendor Engagement', 'Hello John.Â 


Thanks for pointing out that the stated files were not attached. It has been resolved now!


On 2026-09-02 09:26:18, Akoma wrote:

Hello John.Â 
Find attached the invoice for the project along with the action plan with timeline.Â 
We look forward to getting started on the project. Our team is ready to begin.


Regards


On 2026-09-02 06:57:29, John Moses wrote:


Dear Okoma,


Top of the morning to you.


As disscused, kindly share an invoice that contains a means of mobilization payment.


Warm regards,
From: John Moses <John.Moses@whytelabeltech.com>
Sent: Monday, August 31, 2026 6:52 PM
To: Emmanuel Bassey <emmanuel.bassey@assetsmfb.com>; Office of the MD <office.md@assetsmfb.com>; Praise Sanusi <praise.sanusi@assetsmfb.com>
Cc: Saheed Otusajo <saheed.otusajo@canarypointholding.com>; Wisdom Ibanga <wisdom.ibanga@whytelabeltech.com>; Abayomi Olufemi <abayomi.olufemi@whytelabeltech.com>
Subject: Re: Vulnerability Assessment and Penetration Test (VAPT) - Vendor Engagement
Â 
Dear MD,


Thanks for you support.


I will reach out to the vendor to commence implementation.


Warm regards.


Get Outlook for iOS
From: Emmanuel Bassey <emmanuel.bassey@assetsmfb.com>
Sent: Monday, 31 August 2026 16:05:40
To: John Moses <John.Moses@whytelabeltech.com>; Office of the MD <office.md@assetsmfb.com>; Praise Sanusi <praise.sanusi@assetsmfb.com>
Cc: Saheed Otusajo <saheed.otusajo@canarypointholding.com>; Wisdom Ibanga <wisdom.ibanga@whytelabeltech.com>; Abayomi Olufemi <abayomi.olufemi@whytelabeltech.com>
Subject: Re: Vulnerability Assessment and Penetration Test (VAPT) - Vendor Engagement
Â 
Thanks John,


This is approved.




From: John Moses <John.Moses@whytelabeltech.com>
Sent: Monday, August 31, 2026 9:13 AM
To: Office of the MD <office.md@assetsmfb.com>; Praise Sanusi <praise.sanusi@assetsmfb.com>
Cc: Saheed Otusajo <saheed.otusajo@canarypointholding.com>; Wisdom Ibanga <wisdom.ibanga@whytelabeltech.com>; Abayomi Olufemi <abayomi.olufemi@whytelabeltech.com>; Emmanuel Bassey <emmanuel.bassey@assetsmfb.com>
Subject: Re: Vulnerability Assessment and Penetration Test (VAPT) - Vendor Engagement


Dear Praise,


As discussed.


I am bumping this to the top of you mail.


Warm regards,


From: John Moses <John.Moses@whytelabeltech.com>
Sent: Monday, August 17, 2026 11:36 AM
To: Emmanuel Bassey <emmanuel.bassey@assetsmfb.com>; Office of the MD <office.md@assetsmfb.com>
Cc: Saheed Otusajo <saheed.otusajo@canarypointholding.com>; Wisdom Ibanga <wisdom.ibanga@whytelabeltech.com>; Abayomi Olufemi <abayomi.olufemi@whytelabeltech.com>
Subject: Re: Vulnerability Assessment and Penetration Test (VAPT) - Vendor Engagement
Â 
Dear MD,
I am writing to follow up on the outstanding approval for this activity.
The timely execution of the independent VAPT assessment is critical, as it is currently a dependency for some of our ongoing third-party vendor integrations. The vendors have specifically requested evidence of an independent security assessment before proceeding with the integrations.
Kindly assist with the necessary approval to proceed with the engagement of the vendor and avoid further delays to the ongoing integrations.
Warm regards,
From: John Moses <John.Moses@whytelabeltech.com>
Sent: Thursday, July 30, 2026 1:46 PM
To: Emmanuel Bassey <emmanuel.bassey@assetsmfb.com>; Office of the MD <office.md@assetsmfb.com>
Cc: Saheed Otusajo <saheed.otusajo@canarypointholding.com>; Wisdom Ibanga <wisdom.ibanga@whytelabeltech.com>; Abayomi Olufemi <abayomi.olufemi@whytelabeltech.com>
Subject: Re: Vulnerability Assessment and Penetration Test (VAPT)
Â 
Dear MD,
Following your previous approval to engage Vendors to help with our Annual Independent VAPT.
I would like to seek your approval for the attached Vulnerability Assessment and Penetration Testing (VAPT) engagement proposal from Kreatix Technologies for our organization''s infrastructure.
The engagement will cover both External and Internal Network VAPT, including our public-facing applications, APIs, servers, network infrastructure, firewalls, VPNs, wireless environment, and overall security architecture.
The assessment is designed to independently validate our security posture through controlled penetration testing and provide both Executive and Technical reports with remediation recommendations. The engagement is expected to be completed within 15 business days, with a total project cost of â¦2,365,000 (inclusive of VAT). A 70% Down payment is required to commence without delay.
This engagement is important for the following reasons:

Regulatory Compliance: It supports our compliance obligations under the Central Bank of Nigeria (CBN) Cybersecurity Framework and the Nigeria Data Protection Act (NDPA), both of which require periodic independent security assessments of critical systems.

Independent Security Assurance: It provides an independent review of our security controls to identify vulnerabilities before they can be exploited, ensuring management has an objective assessment of our cyber risk posture.

NPS Integration Requirement: Completion of an independent VAPT is a mandatory prerequisite for our NPS integration. At present, this assessment is a critical blocker, and the integration cannot proceed until the VAPT has been successfully completed and the findings addressed where necessary.

Given the regulatory significance and our dependence on the NPS integration timeline, I kindly request your approval to proceed with this engagement so we can commence the assessment without delay.

Warm regards,
From: akoma@kreatixtech.com <akoma@kreatixtech.com>
Sent: Wednesday, July 29, 2026 6:58 PM
To: John Moses <john.moses@whytelabeltech.com>
Cc: Saheed Otusajo <saheed.otusajo@canarypointholding.com>; Wisdom Ibanga <wisdom.ibanga@whytelabeltech.com>; Emmanuel Bassey <emmanuel.bassey@assetsmfb.com>
Subject: Vulnerability Assessment and Penetration Test (VAPT)
Â 
â  WARNING: THIS EMAIL ORIGINATED FROM AN EXTERNAL SOURCE. DO NOT CLICK LINKS OR OPEN ATTACHMENTS UNLESS YOU RECOGNIZE THE SENDER AND KNOW THE CONTENT IS SAFE.
Hello John.Â 


Thanks for reaching out. With regard to the VAPT exercise, find attached our proposal in view of your stated scope.Â 


We took due consideration of our commitment to keep you as our clients and gave you our best price.Â 


We are keen to work with you to ensure you have a greater security profile for your applications.




Onyedikachi Akoma
Business Head
+234 7039612627
akoma@kreatixtech.com
https://kreatixtech.com



Best regards,


John Moses


Lead Information Security Officer


Assets Microfinance Bank


ðÂ Â  17A, Dele Adedeji Street, Off Bisola Durosimi-Etti Street, Lekki Phase 1


ðÂ Â 


âï¸Â Â  John.Moses@whytelabeltech.com


ðÂ Â  https://www.assetsmfb.com/





Best regards,


Emmanuel M Bassey


MD/CEO


Assets Microfinance Bank


ðÂ Â  17A, Dele Adedeji Street, Off Bisola Durosimi-Etti Street, Lekki Phase 1


ðÂ Â  07047649155


âï¸Â Â  emmanuel.bassey@assetsmfb.com


ðÂ Â  https://www.assetsmfb.com/


This email (including attachments) contains information which may be confidential and legally privileged unless the content clearly indicates otherwise, it is intended solely for the use of the individual or entity to whom it is addressed. Unless you are the intended recipient, you may not use, copy or disclose to anyone the message or any information contained in the message or from any attachments that were sent with this email, and if you have received this email message in error, please notify the sender by email, and delete the message. Any use, dissemination, distribution, or reproduction of this message by unintended recipients is not authorised. Caution should be observed in placing any reliance upon any information contained in this e-mail, which is not intended to be a representation to make any decision and any decision taken based on the information provided in this e-mail, should only be made after consultation with appropriate legal, regulatory, technical, financial, and accounting advisors. Assets MFB accepts no responsibility whatsoever for any loss, direct, indirect or consequential, arising from information made available and actions resulting there from. For more information about Asset Microfinance Bank, please visit us at www.assetsmfb.com



Best regards,
John Moses
Lead Information Security Officer
Assets Microfinance Bank
ðÂ Â  17A, Dele Adedeji Street, Off Bisola Durosimi-Etti Street, Lekki Phase 1
ðÂ Â 
âï¸Â Â  John.Moses@whytelabeltech.com
ðÂ Â  https://www.assetsmfb.com/
', 'Hello John.&nbsp;<div><br></div><div>Thanks for pointing out that the stated files were not attached. It has been resolved now!<br><br><blockquote style="border-left:2px solid #E8E5E0;padding-left:12px;margin:0;color:#6B6F76;font-size:13px;">On 2026-09-02 09:26:18, Akoma wrote:<br><br>Hello John.&nbsp;<div>Find attached the invoice for the project along with the action plan with timeline.&nbsp;</div><div>We look forward to getting started on the project. Our team is ready to begin.</div><div><br></div><div>Regards<br><br><blockquote style="border-left:2px solid #E8E5E0;padding-left:12px;margin:0;color:#6B6F76;font-size:13px;">On 2026-09-02 06:57:29, John Moses wrote:<br><br>

<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<style type="text/css" style="display:none;"> P {margin-top:0;margin-bottom:0;} </style>


<div class="elementToProof" style="font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Dear Okoma,</div>
<div class="elementToProof" style="font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<div class="elementToProof" style="font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Top of the morning to you.</div>
<div class="elementToProof" style="font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<div class="elementToProof" style="font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
As disscused, kindly share an invoice that contains a means of mobilization payment.</div>
<div class="elementToProof" style="font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<div class="elementToProof" style="font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Warm regards,</div>
<hr style="display: inline-block; width: 98%;">
<div id="divRplyFwdMsg">
<div style="direction: ltr; font-family: Calibri, sans-serif; font-size: 11pt; color: rgb(0, 0, 0);">
<b>From:</b> John Moses &lt;John.Moses@whytelabeltech.com&gt;<br>
<b>Sent:</b> Monday, August 31, 2026 6:52 PM<br>
<b>To:</b> Emmanuel Bassey &lt;emmanuel.bassey@assetsmfb.com&gt;; Office of the MD &lt;office.md@assetsmfb.com&gt;; Praise Sanusi &lt;praise.sanusi@assetsmfb.com&gt;<br>
<b>Cc:</b> Saheed Otusajo &lt;saheed.otusajo@canarypointholding.com&gt;; Wisdom Ibanga &lt;wisdom.ibanga@whytelabeltech.com&gt;; Abayomi Olufemi &lt;abayomi.olufemi@whytelabeltech.com&gt;<br>
<b>Subject:</b> Re: Vulnerability Assessment and Penetration Test (VAPT) - Vendor Engagement</div>
<div style="direction: ltr;">&nbsp;</div>
</div>
<div style="direction: ltr; font-family: Aptos, Aptos_MSFontService, -apple-system, Roboto, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Dear MD,</div>
<div style="direction: ltr; font-family: Aptos, Aptos_MSFontService, -apple-system, Roboto, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<div style="direction: ltr; font-family: Aptos, Aptos_MSFontService, -apple-system, Roboto, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Thanks for you support.</div>
<div style="direction: ltr; font-family: Aptos, Aptos_MSFontService, -apple-system, Roboto, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<div style="direction: ltr; font-family: Aptos, Aptos_MSFontService, -apple-system, Roboto, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
I will reach out to the vendor to commence implementation.</div>
<div style="direction: ltr; font-family: Aptos, Aptos_MSFontService, -apple-system, Roboto, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<div style="direction: ltr; font-family: Aptos, Aptos_MSFontService, -apple-system, Roboto, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Warm regards.</div>
<div id="x_ms-outlook-mobile-body-separator-line">
<div style="direction: ltr; font-family: Aptos, Aptos_MSFontService, -apple-system, Roboto, Arial, Helvetica, sans-serif; font-size: 12pt;">
<br>
</div>
</div>
<div id="x_ms-outlook-mobile-signature">
<div style="direction: ltr; font-family: Aptos, Aptos_MSFontService, -apple-system, Roboto, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Get <a href="https://aka.ms/o0ukef" id="OWA93542c01-ff1a-aee0-7275-00f70d581b74" class="OWAAutoLink" data-auth="NotApplicable">
Outlook for iOS</a></div>
</div>
<hr style="display: inline-block; width: 98%;">
<div id="x_divRplyFwdMsg">
<div style="direction: ltr; font-family: Calibri, sans-serif; font-size: 11pt; color: rgb(0, 0, 0);">
<b>From:</b> Emmanuel Bassey &lt;emmanuel.bassey@assetsmfb.com&gt;<br>
<b>Sent:</b> Monday, 31 August 2026 16:05:40<br>
<b>To:</b> John Moses &lt;John.Moses@whytelabeltech.com&gt;; Office of the MD &lt;office.md@assetsmfb.com&gt;; Praise Sanusi &lt;praise.sanusi@assetsmfb.com&gt;<br>
<b>Cc:</b> Saheed Otusajo &lt;saheed.otusajo@canarypointholding.com&gt;; Wisdom Ibanga &lt;wisdom.ibanga@whytelabeltech.com&gt;; Abayomi Olufemi &lt;abayomi.olufemi@whytelabeltech.com&gt;<br>
<b>Subject:</b> Re: Vulnerability Assessment and Penetration Test (VAPT) - Vendor Engagement</div>
<div style="direction: ltr;">&nbsp;</div>
</div>
<div style="direction: ltr; font-family: &quot;Product Sans&quot;; font-size: 10pt; color: rgb(0, 0, 0);">
Thanks John,</div>
<div style="direction: ltr; font-family: &quot;Product Sans&quot;; font-size: 10pt; color: rgb(0, 0, 0);">
<br>
</div>
<div style="direction: ltr; font-family: &quot;Product Sans&quot;; font-size: 10pt; color: rgb(0, 0, 0);">
This is approved.</div>
<div style="direction: ltr;"><br>
</div>
<div style="direction: ltr; font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<hr style="direction: ltr; display: inline-block; width: 98%;">
<div style="direction: ltr; font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<b>From:</b> John Moses &lt;John.Moses@whytelabeltech.com&gt;<br>
<b>Sent:</b> Monday, August 31, 2026 9:13 AM<br>
<b>To:</b> Office of the MD &lt;office.md@assetsmfb.com&gt;; Praise Sanusi &lt;praise.sanusi@assetsmfb.com&gt;<br>
<b>Cc:</b> Saheed Otusajo &lt;saheed.otusajo@canarypointholding.com&gt;; Wisdom Ibanga &lt;wisdom.ibanga@whytelabeltech.com&gt;; Abayomi Olufemi &lt;abayomi.olufemi@whytelabeltech.com&gt;; Emmanuel Bassey &lt;emmanuel.bassey@assetsmfb.com&gt;<br>
<b>Subject:</b> Re: Vulnerability Assessment and Penetration Test (VAPT) - Vendor Engagement</div>
<div style="direction: ltr; font-family: Calibri, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Dear Praise,</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
As discussed.</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
I am bumping this to the top of you mail.</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Warm regards,</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<hr style="direction: ltr; display: inline-block; width: 98%;">
<div id="x_x_x_divRplyFwdMsg">
<div style="direction: ltr; font-family: Calibri, sans-serif; font-size: 11pt; color: rgb(0, 0, 0);">
<b>From:</b> John Moses &lt;John.Moses@whytelabeltech.com&gt;<br>
<b>Sent:</b> Monday, August 17, 2026 11:36 AM<br>
<b>To:</b> Emmanuel Bassey &lt;emmanuel.bassey@assetsmfb.com&gt;; Office of the MD &lt;office.md@assetsmfb.com&gt;<br>
<b>Cc:</b> Saheed Otusajo &lt;saheed.otusajo@canarypointholding.com&gt;; Wisdom Ibanga &lt;wisdom.ibanga@whytelabeltech.com&gt;; Abayomi Olufemi &lt;abayomi.olufemi@whytelabeltech.com&gt;<br>
<b>Subject:</b> Re: Vulnerability Assessment and Penetration Test (VAPT) - Vendor Engagement</div>
<div style="direction: ltr;">&nbsp;</div>
</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Dear MD,</div>
<div style="direction: ltr; margin-top: 1em; margin-bottom: 1em; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
I am writing to follow up on the outstanding approval for this activity.</div>
<div style="direction: ltr; margin-top: 1em; margin-bottom: 1em; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
The timely execution of the independent VAPT assessment is critical, as it is currently a dependency for some of our ongoing third-party vendor integrations. The vendors have specifically requested evidence of an independent security assessment before proceeding
 with the integrations.</div>
<div style="direction: ltr; margin-top: 1em; margin-bottom: 1em; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Kindly assist with the necessary approval to proceed with the engagement of the vendor and avoid further delays to the ongoing integrations.</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Warm regards,</div>
<hr style="direction: ltr; display: inline-block; width: 98%;">
<div id="x_x_x_x_divRplyFwdMsg">
<div style="direction: ltr; font-family: Calibri, sans-serif; font-size: 11pt; color: rgb(0, 0, 0);">
<b>From:</b> John Moses &lt;John.Moses@whytelabeltech.com&gt;<br>
<b>Sent:</b> Thursday, July 30, 2026 1:46 PM<br>
<b>To:</b> Emmanuel Bassey &lt;emmanuel.bassey@assetsmfb.com&gt;; Office of the MD &lt;office.md@assetsmfb.com&gt;<br>
<b>Cc:</b> Saheed Otusajo &lt;saheed.otusajo@canarypointholding.com&gt;; Wisdom Ibanga &lt;wisdom.ibanga@whytelabeltech.com&gt;; Abayomi Olufemi &lt;abayomi.olufemi@whytelabeltech.com&gt;<br>
<b>Subject:</b> Re: Vulnerability Assessment and Penetration Test (VAPT)</div>
<div style="direction: ltr;">&nbsp;</div>
</div>
<div style="direction: ltr; margin-top: 1em; margin-bottom: 1em; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Dear MD,</div>
<div style="direction: ltr; margin-top: 1em; margin-bottom: 1em; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Following your previous approval to engage Vendors to help with our Annual Independent VAPT.</div>
<div style="direction: ltr; margin-top: 1em; margin-bottom: 1em; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
I would like to seek your approval for the attached Vulnerability Assessment and Penetration Testing (VAPT) engagement proposal from Kreatix Technologies for our organization''s infrastructure.</div>
<div style="direction: ltr; margin-top: 1em; margin-bottom: 1em; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
The engagement will cover both <b>External and Internal Network VAPT</b>, including our public-facing applications, APIs, servers, network infrastructure, firewalls, VPNs, wireless environment, and overall security architecture.</div>
<div style="direction: ltr; margin-top: 1em; margin-bottom: 1em; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
The assessment is designed to independently validate our security posture through controlled penetration testing and provide both Executive and Technical reports with remediation recommendations. The engagement is expected to be completed within
<b>15 business days</b>, with a total project cost of <b>â¦2,365,000 (inclusive of VAT)</b>. A
<b>70%</b> Down payment is required to commence without delay.</div>
<div style="direction: ltr; margin-top: 1em; margin-bottom: 1em; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
This engagement is important for the following reasons:</div>
<ul data-start="1082" data-end="1887" style="direction: ltr;">
<li style="font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<p role="presentation" style="direction: ltr; margin-top: 12pt; margin-bottom: 0px;">
<b>Regulatory Compliance:</b> It supports our compliance obligations under the <b>
Central Bank of Nigeria (CBN) Cybersecurity Framework</b> and the <b>Nigeria Data Protection Act (NDPA)</b>, both of which require periodic independent security assessments of critical systems.</p>
</li><li style="font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<p role="presentation" style="direction: ltr; margin-top: 12pt; margin-bottom: 0px;">
<b>Independent Security Assurance:</b> It provides an independent review of our security controls to identify vulnerabilities before they can be exploited, ensuring management has an objective assessment of our cyber risk posture.</p>
</li><li style="font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<p role="presentation" style="direction: ltr; margin-top: 12pt; margin-bottom: 0px;">
<b>NPS Integration Requirement:</b> Completion of an independent VAPT is a <b>mandatory prerequisite for our NPS integration</b>. At present, this assessment is a
<b>critical blocker</b>, and the integration cannot proceed until the VAPT has been successfully completed and the findings addressed where necessary.</p>
</li></ul>
<p style="direction: ltr; margin-top: 12pt; margin-bottom: 1em; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Given the regulatory significance and our dependence on the NPS integration timeline, I kindly request your approval to proceed with this engagement so we can commence the assessment without delay.</p>
<div style="direction: ltr; margin-top: 1em; margin-bottom: 1em; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
Warm regards,</div>
<hr style="direction: ltr; display: inline-block; width: 98%;">
<div id="x_x_x_x_x_divRplyFwdMsg">
<div style="direction: ltr; font-family: Calibri, sans-serif; font-size: 11pt; color: rgb(0, 0, 0);">
<b>From:</b> akoma@kreatixtech.com &lt;akoma@kreatixtech.com&gt;<br>
<b>Sent:</b> Wednesday, July 29, 2026 6:58 PM<br>
<b>To:</b> John Moses &lt;john.moses@whytelabeltech.com&gt;<br>
<b>Cc:</b> Saheed Otusajo &lt;saheed.otusajo@canarypointholding.com&gt;; Wisdom Ibanga &lt;wisdom.ibanga@whytelabeltech.com&gt;; Emmanuel Bassey &lt;emmanuel.bassey@assetsmfb.com&gt;<br>
<b>Subject:</b> Vulnerability Assessment and Penetration Test (VAPT)</div>
<div style="direction: ltr;">&nbsp;</div>
</div>
<div style="direction: ltr; background-color: rgb(255, 243, 205); padding: 10px; border-width: 2px; border-style: solid; border-color: red; color: rgb(133, 100, 4);">
<b>â  WARNING: THIS EMAIL ORIGINATED FROM AN EXTERNAL SOURCE. DO NOT CLICK LINKS OR OPEN ATTACHMENTS UNLESS YOU RECOGNIZE THE SENDER AND KNOW THE CONTENT IS SAFE.</b></div>
<div style="direction: ltr; text-align: left; text-indent: 0px; background-color: rgb(255, 255, 255); margin: 0px; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: black;">
Hello John.&nbsp;</div>
<div style="direction: ltr; text-align: left; text-indent: 0px; background-color: rgb(255, 255, 255); margin: 0px; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: black;">
<br>
</div>
<div style="direction: ltr; text-align: left; text-indent: 0px; background-color: rgb(255, 255, 255); margin: 0px; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: black;">
Thanks for reaching out. With regard to the VAPT exercise, find attached our proposal in view of your stated scope.&nbsp;</div>
<div style="direction: ltr; text-align: left; text-indent: 0px; background-color: rgb(255, 255, 255); margin: 0px; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: black;">
<br>
</div>
<div style="direction: ltr; text-align: left; text-indent: 0px; background-color: rgb(255, 255, 255); margin: 0px; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: black;">
We took due consideration of our commitment to keep you as our clients and gave you our best price.&nbsp;</div>
<div style="direction: ltr; text-align: left; text-indent: 0px; background-color: rgb(255, 255, 255); margin: 0px; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: black;">
<br>
</div>
<div style="direction: ltr; text-align: left; text-indent: 0px; background-color: rgb(255, 255, 255); margin: 0px; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: black;">
We are keen to work with you to ensure you have a greater security profile for your applications.</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<div id="x_x_x_x_x_x_Signature">
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<br>
</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<b>Onyedikachi Akoma</b></div>
<div style="direction: ltr; font-family: &quot;Ink Free&quot;; font-size: 12pt; color: rgb(0, 0, 0);">
<i>Business Head</i></div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
+234 7039612627</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
akoma@kreatixtech.com</div>
<div style="direction: ltr; font-family: Aptos, Aptos_EmbeddedFont, Aptos_MSFontService, Calibri, Helvetica, sans-serif; font-size: 12pt; color: rgb(0, 0, 0);">
<span class="spanWithBackgroundColor" style="background-color: rgb(255, 255, 0);">https://kreatixtech.com</span></div>
</div>
<div style="direction: ltr;"><br>
<br>
</div>
<table cellspacing="0" cellpadding="0" border="0" style="direction: ltr; width: 600px; color: rgb(17, 24, 39);">
<tbody>
<tr>
<td style="direction: ltr; padding-bottom: 8px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif; font-size: 11pt; color: rgb(17, 24, 39);">
Best regards,</div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 3px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif; font-size: 14.5pt; color: rgb(11, 94, 215);">
<b>John Moses</b></div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 4px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif; font-size: 11.5pt; color: rgb(55, 65, 81);">
<b>Lead Information Security Officer</b></div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 10px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif; font-size: 10.8pt; color: rgb(17, 24, 39);">
<b>Assets Microfinance Bank</b></div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 4px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif;"><span style="font-size: 10.5pt; color: rgb(11, 94, 215);">ð</span><span style="font-size: 10.5pt; color: rgb(17, 24, 39);">&nbsp;&nbsp;
</span><span style="font-size: 10.2pt; color: rgb(17, 24, 39);">17A, Dele Adedeji Street, Off Bisola Durosimi-Etti Street, Lekki Phase 1</span></div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 4px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif; font-size: 10.5pt;">
<span style="color: rgb(11, 94, 215);">ð</span><span style="color: rgb(17, 24, 39);">&nbsp;&nbsp;</span></div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 4px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif;"><span style="font-size: 10.5pt; color: rgb(11, 94, 215);">âï¸</span><span style="font-size: 10.5pt; color: rgb(17, 24, 39);">&nbsp;&nbsp;
</span><span style="font-size: 10.2pt; color: rgb(30, 102, 245);"><a href="mailto:John.Moses@whytelabeltech.com" id="OWA0e3056d5-b73e-1bea-3ffd-f5a3f77954aa" class="x_x_OWAAutoLink" style="color: rgb(30, 102, 245);"><u>John.Moses@whytelabeltech.com</u></a></span></div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 14px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif;"><span style="font-size: 10.5pt; color: rgb(11, 94, 215);">ð</span><span style="font-size: 10.5pt; color: rgb(17, 24, 39);">&nbsp;&nbsp;
</span><span style="font-size: 10.2pt; color: rgb(30, 102, 245);"><a href="https://www.assetsmfb.com/" id="OWA5328a01b-e665-cdd3-3198-e00ff058f8b7" class="x_x_OWAAutoLink" originalsrc="https://www.assetsmfb.com/" data-auth="NotApplicable" style="color: rgb(30, 102, 245);"><u>https://www.assetsmfb.com/</u></a></span></div>
</td>
</tr>
<tr>
<td style="direction: ltr;"><span style="font-family: &quot;Segoe UI&quot;, Arial, sans-serif; font-size: 10.5pt; color: rgb(17, 24, 39);"><img alt="Assets Microfinance Bank" width="600" style="width: 600px; height: auto; max-width: 600px; display: block;" src="https://i.imghippo.com/files/qPra7700jIE.png"></span></td>
</tr>
</tbody>
</table>
<div style="direction: ltr;"><br>
<br>
</div>
<table cellspacing="0" cellpadding="0" border="0" style="direction: ltr; width: 600px; color: rgb(17, 24, 39);">
<tbody>
<tr>
<td style="direction: ltr; padding-bottom: 8px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif; font-size: 11pt; color: rgb(17, 24, 39);">
Best regards,</div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 3px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif; font-size: 14.5pt; color: rgb(11, 94, 215);">
<b>Emmanuel M Bassey</b></div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 4px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif; font-size: 11.5pt; color: rgb(55, 65, 81);">
<b>MD/CEO</b></div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 10px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif; font-size: 10.8pt; color: rgb(17, 24, 39);">
<b>Assets Microfinance Bank</b></div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 4px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif;"><span style="font-size: 10.5pt; color: rgb(11, 94, 215);">ð</span><span style="font-size: 10.5pt; color: rgb(17, 24, 39);">&nbsp;&nbsp;
</span><span style="font-size: 10.2pt; color: rgb(17, 24, 39);">17A, Dele Adedeji Street, Off Bisola Durosimi-Etti Street, Lekki Phase 1</span></div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 4px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif;"><span style="font-size: 10.5pt; color: rgb(11, 94, 215);">ð</span><span style="font-size: 10.5pt; color: rgb(17, 24, 39);">&nbsp;&nbsp;
</span><span style="font-size: 10.2pt; color: rgb(17, 24, 39);">07047649155</span></div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 4px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif;"><span style="font-size: 10.5pt; color: rgb(11, 94, 215);">âï¸</span><span style="font-size: 10.5pt; color: rgb(17, 24, 39);">&nbsp;&nbsp;
</span><span style="font-size: 10.2pt; color: rgb(30, 102, 245);"><a href="mailto:emmanuel.bassey@assetsmfb.com" id="OWA527c5fbb-52d7-009e-e17d-be87b5626494" class="OWAAutoLink" style="color: rgb(30, 102, 245);"><u>emmanuel.bassey@assetsmfb.com</u></a></span></div>
</td>
</tr>
<tr>
<td style="direction: ltr; padding-bottom: 14px;">
<div style="direction: ltr; font-family: &quot;Segoe UI&quot;, Arial, sans-serif;"><span style="font-size: 10.5pt; color: rgb(11, 94, 215);">ð</span><span style="font-size: 10.5pt; color: rgb(17, 24, 39);">&nbsp;&nbsp;
</span><span style="font-size: 10.2pt; color: rgb(30, 102, 245);"><a href="https://www.assetsmfb.com/" id="OWA46d4fda0-bb2b-f9a4-3510-1f198c8ed300" class="OWAAutoLink" originalsrc="https://www.assetsmfb.com/" data-auth="NotApplicable" style="color: rgb(30, 102, 245);"><u>https://www.assetsmfb.com/</u></a></span></div>
</td>
</tr>
<tr>
<td style="direction: ltr;"><span style="font-family: &quot;Segoe UI&quot;, Arial, sans-serif; font-size: 10.5pt; color: rgb(17, 24, 39);"><img alt="Assets Microfinance Bank" width="600" style="width: 600px; height: auto; max-width: 600px; display: block;" src="https://i.imghippo.com/files/qPra7700jIE.png"></span></td>
</tr>
</tbody>
</table>
<div style="direction: ltr;">This email (including attachments) contains information which may be confidential and legally privileged unless the content clearly indicates otherwise, it is intended solely for the use of the individual or entity to whom it is
 addressed. Unless you are the intended recipient, you may not use, copy or disclose to anyone the message or any information contained in the message or from any attachments that were sent with this email, and if you have received this email message in error,
 please notify the sender by email, and delete the message. Any use, dissemination, distribution, or reproduction of this message by unintended recipients is not authorised. Caution should be observed in placing any reliance upon any information contained in
 this e-mail, which is not intended to be a representation to make any decision and any decision taken based on the information provided in this e-mail, should only be made after consultation with appropriate legal, regulatory, technical, financial, and accounting
 advisors. Assets MFB accepts no responsibility whatsoever for any loss, direct, indirect or consequential, arising from information made available and actions resulting there from. For more information about Asset Microfinance Bank, please visit us at www.assetsmfb.com</div>
<br>
<br>
<table cellpadding="0" cellspacing="0" border="0" width="600" style="font-family: Segoe UI, Arial, sans-serif; color:#111827; font-size:10.5pt;">
<!-- Best regards -->
<tbody>
<tr>
<td style="padding-bottom:8px;"><span style="font-size:11pt;">Best regards,</span>
</td>
</tr>
<!-- Name -->
<tr>
<td style="padding-bottom:3px;"><span style="font-size:14.5pt; font-weight:bold; color:#0B5ED7;">John Moses
</span></td>
</tr>
<!-- Job title (auto-collapses if empty) -->
<tr>
<td style="padding-bottom:4px;"><span style="font-size:11.5pt; font-weight:bold; color:#374151;">Lead Information Security Officer
</span></td>
</tr>
<!-- Company -->
<tr>
<td style="padding-bottom:10px;"><span style="font-size:10.8pt; font-weight:bold;">Assets Microfinance Bank
</span></td>
</tr>
<!-- Address (static, always shown) -->
<tr>
<td style="padding-bottom:4px;"><span style="color:#0B5ED7;">ð</span>&nbsp;&nbsp; <span style="font-size:10.2pt;">
17A, Dele Adedeji Street, Off Bisola Durosimi-Etti Street, Lekki Phase 1 </span></td>
</tr>
<!-- Phone (minimised if empty) -->
<tr>
<td style="padding-bottom:4px;"><span style="color:#0B5ED7;">ð</span>&nbsp;&nbsp; <span style="font-size:10.2pt;">
</span></td>
</tr>
<!-- Email (almost always present) -->
<tr>
<td style="padding-bottom:4px;"><span style="color:#0B5ED7;">âï¸</span>&nbsp;&nbsp; <span style="font-size:10.2pt;">
<a href="mailto:John.Moses@whytelabeltech.com" style="color:#1E66F5; text-decoration:underline;">John.Moses@whytelabeltech.com
</a></span></td>
</tr>
<!-- Website -->
<tr>
<td style="padding-bottom:14px;"><span style="color:#0B5ED7;">ð</span>&nbsp;&nbsp; <span style="font-size:10.2pt;">
<a href="https://www.assetsmfb.com/" style="color:#1E66F5; text-decoration:underline;">https://www.assetsmfb.com/
</a></span></td>
</tr>
<!-- Banner -->
<tr>
<td><img src="https://i.imghippo.com/files/qPra7700jIE.png" alt="Assets Microfinance Bank" width="600" style="display:block; border:0; max-width:600px; height:auto;">
</td>
</tr>
</tbody>
</table>


</blockquote></div></blockquote></div>', 'Hello John. Thanks for pointing out that the stated files were not attached. It has been resolved now! On 2026-09-02 09:26:18, Akoma wrote: Hello John. Find attached the invoice for the project along...', 3, 1, 0, 0, 0, 1, 209107, 'outbound', 'sent', '2026-09-02 10:37:25', '2026-09-02 10:37:25', '2026-09-02 10:37:25', '2026-09-02 10:37:25', NULL);

-- Table: attachments (3 rows)
DELETE FROM attachments;
INSERT INTO attachments (id, email_id, user_id, filename, mime_type, size, r2_key, is_inline, content_id, download_url, created_at) VALUES ('bf7af05f-1957-491a-9fe1-76cd1455cbb7', 9, 1, 'INV-000062.pdf', 'application/pdf', 175624, 'attachments/1/9/bf7af05f-1957-491a-9fe1-76cd1455cbb7/INV-000062.pdf', 0, NULL, NULL, '2026-09-02 10:30:22');
INSERT INTO attachments (id, email_id, user_id, filename, mime_type, size, r2_key, is_inline, content_id, download_url, created_at) VALUES ('6f684364-a195-4778-83f3-d617fc2eb843', 10, 1, 'INV-000062.pdf', 'application/pdf', 175624, 'attachments/1/10/6f684364-a195-4778-83f3-d617fc2eb843/INV-000062.pdf', 0, NULL, NULL, '2026-09-02 10:37:25');
INSERT INTO attachments (id, email_id, user_id, filename, mime_type, size, r2_key, is_inline, content_id, download_url, created_at) VALUES ('d9ca7723-347b-4650-9a95-8a0969573b66', 10, 1, 'Asset MFB VAPT Project Plan.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 24908, 'attachments/1/10/d9ca7723-347b-4650-9a95-8a0969573b66/Asset MFB VAPT Project Plan.xlsx', 0, NULL, NULL, '2026-09-02 10:37:25');

-- Table: user_settings (3 rows)
DELETE FROM user_settings;
INSERT INTO user_settings (user_id, theme, density, language, signature_html, auto_save_drafts, show_snippets, items_per_page, reply_to_address, forward_to_address, notify_on_new_email, created_at, updated_at) VALUES (1, 'light', 'comfortable', 'en', NULL, 1, 1, 50, NULL, NULL, 0, '2026-09-01 19:09:22', '2026-09-01 19:09:22');
INSERT INTO user_settings (user_id, theme, density, language, signature_html, auto_save_drafts, show_snippets, items_per_page, reply_to_address, forward_to_address, notify_on_new_email, created_at, updated_at) VALUES (2, 'light', 'comfortable', 'en', NULL, 1, 1, 50, NULL, NULL, 0, '2026-09-02 09:30:30', '2026-09-02 09:30:30');
INSERT INTO user_settings (user_id, theme, density, language, signature_html, auto_save_drafts, show_snippets, items_per_page, reply_to_address, forward_to_address, notify_on_new_email, created_at, updated_at) VALUES (3, 'light', 'comfortable', 'en', NULL, 1, 1, 50, NULL, NULL, 0, '2026-09-02 09:31:10', '2026-09-02 09:31:10');

-- Table: audit_logs (13 rows)
DELETE FROM audit_logs;
INSERT INTO audit_logs (id, user_id, action, resource, resource_id, ip_address, user_agent, details, created_at) VALUES (1, 1, 'login', 'user', 1, '102.88.169.209', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9278', NULL, '2026-09-01 19:10:26');
INSERT INTO audit_logs (id, user_id, action, resource, resource_id, ip_address, user_agent, details, created_at) VALUES (2, 1, 'login', 'user', 1, '102.88.169.209', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9278', NULL, '2026-09-01 19:10:32');
INSERT INTO audit_logs (id, user_id, action, resource, resource_id, ip_address, user_agent, details, created_at) VALUES (3, 1, 'login', 'user', 1, '102.88.169.209', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0', NULL, '2026-09-01 19:11:10');
INSERT INTO audit_logs (id, user_id, action, resource, resource_id, ip_address, user_agent, details, created_at) VALUES (4, 1, 'send', 'email', 1, '102.88.168.102', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0', '{"to":"onyedika.akoma@gmail.com","subject":"Test"}', '2026-09-02 02:34:39');
INSERT INTO audit_logs (id, user_id, action, resource, resource_id, ip_address, user_agent, details, created_at) VALUES (5, 1, 'login', 'user', 1, '102.88.168.102', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0', NULL, '2026-09-02 03:27:18');
INSERT INTO audit_logs (id, user_id, action, resource, resource_id, ip_address, user_agent, details, created_at) VALUES (6, 1, 'send', 'email', 3, '102.88.168.102', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0', '{"to":"onyedika.akoma@gmail.com","subject":"Test"}', '2026-09-02 03:28:55');
INSERT INTO audit_logs (id, user_id, action, resource, resource_id, ip_address, user_agent, details, created_at) VALUES (7, 1, 'login', 'user', 1, '102.88.168.102', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36', NULL, '2026-09-02 07:00:36');
INSERT INTO audit_logs (id, user_id, action, resource, resource_id, ip_address, user_agent, details, created_at) VALUES (8, 1, 'send', 'email', 7, '102.220.173.12', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0', '{"to":"ikechukwu.anyanwu@syscomptech.ng","subject":"Re: Confirmation"}', '2026-09-02 09:16:09');
INSERT INTO audit_logs (id, user_id, action, resource, resource_id, ip_address, user_agent, details, created_at) VALUES (9, 1, 'send', 'email', 8, '102.220.173.12', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0', '{"to":"John.Moses@whytelabeltech.com","subject":"Re: Vulnerability Assessment and Penetration Test (VAPT) - Vendor Engagement"}', '2026-09-02 09:26:19');
INSERT INTO audit_logs (id, user_id, action, resource, resource_id, ip_address, user_agent, details, created_at) VALUES (10, 1, 'send', 'email', 9, '197.210.71.189', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0', '{"to":"onyedika.akoma@gmail.com","subject":"Test Upload"}', '2026-09-02 10:30:22');
INSERT INTO audit_logs (id, user_id, action, resource, resource_id, ip_address, user_agent, details, created_at) VALUES (11, 1, 'send', 'email', 10, '197.210.71.189', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0', '{"to":"akoma@kreatixtech.com","subject":"Re: Vulnerability Assessment and Penetration Test (VAPT) - Vendor Engagement"}', '2026-09-02 10:37:25');
INSERT INTO audit_logs (id, user_id, action, resource, resource_id, ip_address, user_agent, details, created_at) VALUES (12, 1, 'login', 'user', 1, '197.210.71.189', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0', NULL, '2026-09-02 11:11:24');
INSERT INTO audit_logs (id, user_id, action, resource, resource_id, ip_address, user_agent, details, created_at) VALUES (13, 1, 'login', 'user', 1, '197.210.71.189', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0', NULL, '2026-09-02 11:15:13');

-- Table: contacts (5 rows)
DELETE FROM contacts;
INSERT INTO contacts (id, user_id, email, display_name, avatar_url, last_seen, contact_count) VALUES (1, 1, 'onyedika.akoma@gmail.com', 'Onyedikachi Akoma', NULL, '2026-09-02 10:30:22', 4);
INSERT INTO contacts (id, user_id, email, display_name, avatar_url, last_seen, contact_count) VALUES (2, 1, 'John.Moses@whytelabeltech.com', 'John Moses', NULL, '2026-09-02 09:26:19', 2);
INSERT INTO contacts (id, user_id, email, display_name, avatar_url, last_seen, contact_count) VALUES (3, 1, 'apn-info@amazon.com', 'AWS Partner Network', NULL, '2026-09-02 08:02:08', 1);
INSERT INTO contacts (id, user_id, email, display_name, avatar_url, last_seen, contact_count) VALUES (4, 1, 'ikechukwu.anyanwu@syscomptech.ng', 'Ikechukwu Anyanwu', NULL, '2026-09-02 09:16:09', 2);
INSERT INTO contacts (id, user_id, email, display_name, avatar_url, last_seen, contact_count) VALUES (5, 1, 'akoma@kreatixtech.com', NULL, NULL, '2026-09-02 10:37:25', 1);

