import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, BookOpen, Newspaper } from 'lucide-react'
import { GlossaryTable } from '@/components/admin/content/glossary-table'

export default function ContentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Content Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage glossary terms, morning briefings, and news sources
        </p>
      </div>

      <Tabs defaultValue="glossary" className="space-y-6">
        <TabsList className="border-brutal bg-muted">
          <TabsTrigger value="glossary" className="border-brutal data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <BookOpen className="h-4 w-4 mr-2" />
            Glossary
          </TabsTrigger>
          <TabsTrigger value="briefings" className="border-brutal data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileText className="h-4 w-4 mr-2" />
            Morning Briefings
          </TabsTrigger>
          <TabsTrigger value="news" className="border-brutal data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Newspaper className="h-4 w-4 mr-2" />
            News Sources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="glossary" className="space-y-4">
          <GlossaryTable />
        </TabsContent>

        <TabsContent value="briefings" className="space-y-4">
          <div className="border-brutal shadow-brutal bg-card p-8 rounded-lg text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Morning Briefings</p>
            <p className="text-sm text-muted-foreground mt-2">
              Coming soon: View and regenerate daily market briefings
            </p>
          </div>
        </TabsContent>

        <TabsContent value="news" className="space-y-4">
          <div className="border-brutal shadow-brutal bg-card p-8 rounded-lg text-center">
            <Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">News Sources</p>
            <p className="text-sm text-muted-foreground mt-2">
              Coming soon: Configure news feed sources
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
