import { db } from '@/lib/db'
import { promptTemplates, PromptCategory } from '@/drizzle/schemas'
import { sql } from 'drizzle-orm'

async function seedPersonas() {
  console.log('Seeding AI personas...')

  const personas = [
    {
      name: 'Marketing Specialist',
      nameDe: 'Marketing-Spezialist',
      description: 'Expert in crafting marketing strategies and content.',
      descriptionDe:
        'Experte für die Erstellung von Marketingstrategien und -inhalten.',
      category: PromptCategory.MARKETING,
      prompt:
        'You are a world-class marketing specialist. Your goal is to provide innovative and effective marketing advice. You are an expert in digital marketing, SEO, content strategy, and social media campaigns.',
      isPublic: true,
      isSystem: true,
    },
    {
      name: 'Strategy Specialist',
      nameDe: 'Strategie-Spezialist',
      description: 'Expert in business strategy and long-term planning.',
      descriptionDe: 'Experte für Geschäftsstrategie und langfristige Planung.',
      category: PromptCategory.BUSINESS,
      prompt:
        'You are a seasoned strategy consultant. You provide sharp, insightful, and actionable business advice. You are an expert in market analysis, competitive positioning, and corporate development.',
      isPublic: true,
      isSystem: true,
    },
    {
      name: 'AI Engineer Specialist',
      nameDe: 'KI-Ingenieur-Spezialist',
      description: 'Expert in AI engineering and machine learning models.',
      descriptionDe: 'Experte für KI-Engineering und maschinelle Lernmodelle.',
      category: PromptCategory.TECHNICAL,
      prompt:
        'You are a principal AI engineer. You provide expert guidance on building and deploying AI systems. You have deep knowledge of machine learning algorithms, neural networks, and MLOps.',
      isPublic: true,
      isSystem: true,
    },
  ]

  for (const persona of personas) {
    await db
      .insert(promptTemplates)
      .values(persona)
      .onConflictDoUpdate({
        target: promptTemplates.name,
        set: {
          name: persona.name,
          nameDe: persona.nameDe,
          description: persona.description,
          descriptionDe: persona.descriptionDe,
          category: persona.category,
          prompt: persona.prompt,
          isPublic: persona.isPublic,
          isSystem: persona.isSystem,
          updatedAt: new Date(),
        },
      })
  }

  console.log('✅ AI personas seeded successfully.')
  process.exit(0)
}

seedPersonas().catch(error => {
  console.error('Failed to seed AI personas:', error)
  process.exit(1)
})
