import { createClient } from '@/lib/supabase/server'

export interface GlossaryTerm {
  term: string
  definition: string
  category: string
}

export class GlossaryService {
  private static termsCache: GlossaryTerm[] | null = null
  private static cacheTime: number = 0
  private static readonly CACHE_DURATION = 60 * 60 * 1000 // 1 hour

  static async getAllTerms(): Promise<GlossaryTerm[]> {
    const now = Date.now()

    // Return cached terms if still valid
    if (this.termsCache && (now - this.cacheTime) < this.CACHE_DURATION) {
      return this.termsCache
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('glossary_terms')
      .select('term, definition, category')
      .order('term')

    if (error || !data) {
      console.error('Failed to fetch glossary terms:', error)
      return []
    }

    this.termsCache = data as GlossaryTerm[]
    this.cacheTime = now

    return this.termsCache
  }

  static async detectTermsInText(text: string): Promise<GlossaryTerm[]> {
    const allTerms = await this.getAllTerms()
    const detectedTerms: GlossaryTerm[] = []
    const textLower = text.toLowerCase()

    for (const term of allTerms) {
      // Check if term appears as a whole word in the text
      const termLower = term.term.toLowerCase()
      const regex = new RegExp(`\\b${termLower}\\b`, 'i')

      if (regex.test(textLower)) {
        detectedTerms.push(term)
      }
    }

    return detectedTerms
  }

  static highlightTermsInText(text: string, terms: GlossaryTerm[]): string {
    let highlightedText = text

    // Sort terms by length (longest first) to avoid partial replacements
    const sortedTerms = [...terms].sort((a, b) => b.term.length - a.term.length)

    for (const term of sortedTerms) {
      const regex = new RegExp(`\\b(${term.term})\\b`, 'gi')
      highlightedText = highlightedText.replace(
        regex,
        `<span class="glossary-term" data-term="${term.term}" data-definition="${term.definition}" data-category="${term.category}">$1</span>`
      )
    }

    return highlightedText
  }
}
