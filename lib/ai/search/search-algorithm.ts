export interface SearchDocument {
  id: string
  title: string
  description: string
  tags: string[]
  category: string
  duration: number
  viewCount: number
  uploadDate: number
  creator: string
}

export interface SearchResult {
  document: SearchDocument
  score: number
  relevanceSignals: {
    titleMatch: number
    descriptionMatch: number
    tagMatch: number
    popularityBoost: number
    freshnessBoost: number
  }
}

export class SearchAlgorithm {
  private documents: Map<string, SearchDocument> = new Map()
  private invertedIndex: Map<string, Set<string>> = new Map()
  private termFrequency: Map<string, Map<string, number>> = new Map()
  private documentFrequency: Map<string, number> = new Map()

  constructor(documents: SearchDocument[]) {
    this.buildIndex(documents)
  }

  private buildIndex(documents: SearchDocument[]): void {
    for (const doc of documents) {
      this.documents.set(doc.id, doc)
      this.indexDocument(doc)
    }
    
    this.calculateIDF()
  }

  private indexDocument(doc: SearchDocument): void {
    const text = `${doc.title} ${doc.description} ${doc.tags.join(' ')} ${doc.category} ${doc.creator}`
    const terms = this.tokenize(text)
    
    this.termFrequency.set(doc.id, new Map())
    const tf = this.termFrequency.get(doc.id)!
    
    for (const term of terms) {
      // Update inverted index
      if (!this.invertedIndex.has(term)) {
        this.invertedIndex.set(term, new Set())
      }
      this.invertedIndex.get(term)!.add(doc.id)
      
      // Update term frequency
      tf.set(term, (tf.get(term) || 0) + 1)
    }
  }

  private calculateIDF(): void {
    const totalDocs = this.documents.size
    
    for (const [term, docSet] of this.invertedIndex) {
      const df = docSet.size
      this.documentFrequency.set(term, Math.log(totalDocs / df))
    }
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(term => term.length > 2)
  }

  // TF-IDF Scoring
  private calculateTFIDF(docId: string, term: string): number {
    const tf = this.termFrequency.get(docId)?.get(term) || 0
    const idf = this.documentFrequency.get(term) || 0
    
    return tf * idf
  }

  // BM25 Scoring (Better than TF-IDF)
  private calculateBM25(docId: string, queryTerms: string[]): number {
    const doc = this.documents.get(docId)!
    const docLength = this.getDocumentLength(doc)
    const avgDocLength = this.getAverageDocumentLength()
    
    const k1 = 1.5
    const b = 0.75
    
    let score = 0
    
    for (const term of queryTerms) {
      const tf = this.termFrequency.get(docId)?.get(term) || 0
      const idf = this.documentFrequency.get(term) || 0
      
      const numerator = tf * (k1 + 1)
      const denominator = tf + k1 * (1 - b + b * (docLength / avgDocLength))
      
      score += idf * (numerator / denominator)
    }
    
    return score
  }

  private getDocumentLength(doc: SearchDocument): number {
    const text = `${doc.title} ${doc.description} ${doc.tags.join(' ')}`
    return this.tokenize(text).length
  }

  private getAverageDocumentLength(): number {
    let totalLength = 0
    for (const doc of this.documents.values()) {
      totalLength += this.getDocumentLength(doc)
    }
    return totalLength / this.documents.size
  }

  // Main search function
  search(query: string, limit: number = 20): SearchResult[] {
    const queryTerms = this.tokenize(query)
    const candidateDocs = new Set<string>()
    
    // Find candidate documents
    for (const term of queryTerms) {
      const docs = this.invertedIndex.get(term)
      if (docs) {
        for (const docId of docs) {
          candidateDocs.add(docId)
        }
      }
    }
    
    const results: SearchResult[] = []
    
    for (const docId of candidateDocs) {
      const doc = this.documents.get(docId)!
      const relevanceSignals = this.calculateRelevanceSignals(doc, queryTerms)
      const score = this.calculateFinalScore(doc, queryTerms, relevanceSignals)
      
      results.push({
        document: doc,
        score,
        relevanceSignals
      })
    }
    
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  private calculateRelevanceSignals(doc: SearchDocument, queryTerms: string[]): SearchResult['relevanceSignals'] {
    const titleTerms = this.tokenize(doc.title)
    const descTerms = this.tokenize(doc.description)
    const tagTerms = doc.tags.map(tag => tag.toLowerCase())
    
    // Title match (highest weight)
    const titleMatch = queryTerms.filter(term => titleTerms.includes(term)).length / queryTerms.length
    
    // Description match
    const descriptionMatch = queryTerms.filter(term => descTerms.includes(term)).length / queryTerms.length
    
    // Tag match
    const tagMatch = queryTerms.filter(term => tagTerms.includes(term)).length / queryTerms.length
    
    // Popularity boost (log scale)
    const popularityBoost = Math.log(doc.viewCount + 1) / 20
    
    // Freshness boost (recent videos get boost)
    const daysSinceUpload = (Date.now() - doc.uploadDate) / (1000 * 60 * 60 * 24)
    const freshnessBoost = Math.exp(-daysSinceUpload / 30) // Decay over 30 days
    
    return {
      titleMatch,
      descriptionMatch,
      tagMatch,
      popularityBoost,
      freshnessBoost
    }
  }

  private calculateFinalScore(doc: SearchDocument, queryTerms: string[], signals: SearchResult['relevanceSignals']): number {
    // BM25 base score
    const bm25Score = this.calculateBM25(doc.id, queryTerms)
    
    // Weighted combination of signals
    const relevanceScore = 
      signals.titleMatch * 3.0 +           // Title matches are most important
      signals.descriptionMatch * 1.5 +     // Description matches
      signals.tagMatch * 2.0 +             // Tag matches are important
      signals.popularityBoost * 0.5 +      // Popularity boost
      signals.freshnessBoost * 0.3         // Freshness boost
    
    return bm25Score + relevanceScore
  }

  // Autocomplete suggestions
  getSuggestions(prefix: string, limit: number = 10): string[] {
    const suggestions = new Set<string>()
    
    for (const term of this.invertedIndex.keys()) {
      if (term.startsWith(prefix.toLowerCase())) {
        suggestions.add(term)
      }
    }
    
    // Add popular queries (would come from query logs in production)
    const popularQueries = [
      'funny videos', 'music videos', 'gaming', 'tutorials', 
      'news', 'sports highlights', 'movie trailers'
    ]
    
    for (const query of popularQueries) {
      if (query.toLowerCase().includes(prefix.toLowerCase())) {
        suggestions.add(query)
      }
    }
    
    return Array.from(suggestions).slice(0, limit)
  }

  // Personalized search (would integrate with user profile)
  personalizedSearch(query: string, userId: string, userPreferences: string[], limit: number = 20): SearchResult[] {
    const baseResults = this.search(query, limit * 2)
    
    // Boost results based on user preferences
    for (const result of baseResults) {
      let personalBoost = 0
      
      // Category preference boost
      if (userPreferences.includes(result.document.category)) {
        personalBoost += 0.5
      }
      
      // Creator preference boost (if user has watched this creator before)
      // This would come from user history in production
      
      result.score += personalBoost
    }
    
    return baseResults
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }
}