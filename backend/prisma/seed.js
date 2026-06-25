import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed testimonials — clear existing featured ones first
  await prisma.testimonial.deleteMany({ where: { featured: true } });

  const testimonials = [
    {
      clientName: 'Adebola Ogunlesi',
      clientRole: 'CISO',
      clientCompany: 'FinTrust Bank',
      quote: 'Kreatix Technologies transformed our security posture. Their VAPT engagement uncovered critical vulnerabilities our previous audits missed. The remediation plan was actionable and their team was incredibly responsive throughout.',
      metricValue: '94%',
      metricLabel: 'reduction in critical vulnerabilities',
      featured: true,
    },
    {
      clientName: 'Dr. Ngozi Eze',
      clientRole: 'CTO',
      clientCompany: 'HealthSync Africa',
      quote: 'We needed a HIPAA-compliant cloud architecture built from scratch. Kreatix delivered a scalable, secure infrastructure that passed our compliance audit on the first attempt. Outstanding engineering.',
      metricValue: '99.9%',
      metricLabel: 'uptime achieved',
      featured: true,
    },
    {
      clientName: 'Emmanuel Chukwu',
      clientRole: 'Head of Engineering',
      clientCompany: 'AgriTech Solutions',
      quote: 'The custom software platform Kreatix built for us handles 50,000+ daily transactions flawlessly. Their attention to security-by-design principles gave us confidence to scale rapidly across West Africa.',
      metricValue: '3x',
      metricLabel: 'faster deployment cycles',
      featured: true,
    },
  ];

  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }

  console.log(`✅ Seeded ${testimonials.length} testimonials`);

  // Seed a sample blog post
  const blogPost = await prisma.blogPost.upsert({
    where: { slug: 'understanding-vapt-2026' },
    update: {},
    create: {
      title: 'Understanding VAPT: Why Penetration Testing Matters in 2026',
      slug: 'understanding-vapt-2026',
      excerpt: 'As cyber threats grow more sophisticated, regular Vulnerability Assessment and Penetration Testing (VAPT) is no longer optional — it is essential for every organization handling sensitive data.',
      content: `In 2026, the cybersecurity landscape has evolved dramatically. Attackers now leverage AI to automate vulnerability discovery and exploit chains that would have taken weeks to build manually. Organizations that rely on annual security audits are finding themselves dangerously exposed between assessment cycles.

Vulnerability Assessment and Penetration Testing (VAPT) combines automated scanning with manual expert analysis to identify weaknesses before attackers do. Unlike basic vulnerability scans, VAPT includes active exploitation attempts to verify that discovered issues are actually exploitable in your environment.

At Kreatix Technologies, our VAPT methodology follows industry standards including OWASP Top 10, NIST SP 800-115, and PTES. We test web applications, APIs, mobile apps, cloud infrastructure, and internal networks. Every engagement concludes with a detailed report including risk-rated findings, proof-of-concept exploits, and step-by-step remediation guidance.

The most common vulnerabilities we encounter include:
- Broken access controls allowing privilege escalation
- Injection flaws in APIs and search functions
- Misconfigured cloud storage exposing sensitive data
- Outdated dependencies with known CVEs
- Weak authentication mechanisms bypassable via brute force

Regular VAPT — ideally quarterly for critical systems — provides continuous assurance that your security controls are effective. Contact our team to schedule your assessment.`,
      author: 'Lukman Sanni',
      tags: ['VAPT', 'Cybersecurity', 'Penetration Testing'],
      published: true,
      coverImage: null,
    },
  });

  console.log(`✅ Seeded blog post: ${blogPost.title}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
