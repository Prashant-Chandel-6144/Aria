"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {EnvelopeSimpleIcon,GithubLogoIcon,SlackLogoIcon} from '@phosphor-icons/react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { CalendarDays, Mail } from "lucide-react"

export function ConnectForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6 min-h-screen bg-gradient-to-b from-background to-muted/30 items-center justify-center p-4", className)} {...props}>
      <Card className="w-full max-w-md shadow-xl border border-border/40">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-extrabold tracking-tight">Connect Integrations</CardTitle>
          <CardDescription className="text-sm text-muted-foreground leading-relaxed">
            Link your tools to sync email, calendar events, and repos to your Aria AI workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup className="space-y-3.5">
              <Field className="space-y-3">
                <Button 
                  variant="outline" 
                  type="button"
                  className="w-full h-12 text-sm font-semibold hover:bg-accent hover:text-accent-foreground transition-all active:scale-[0.98]"
                  onClick={() => window.location.href = '/api/connect?plugin=gmail'}
                >
                  <EnvelopeSimpleIcon size={20} className="mr-2 text-rose-500" />
                  Connect with Gmail
                </Button>
                <Button 
                  variant="outline" 
                  type="button"
                  className="w-full h-12 text-sm font-semibold hover:bg-accent hover:text-accent-foreground transition-all active:scale-[0.98]"
                  onClick={() => window.location.href = '/api/connect?plugin=googlecalendar'}

                >
                  <CalendarDays size={20} className="mr-2 text-blue-500" />
                  Connect with Google Calendar
                </Button>
                <Button 
                  variant="outline" 
                  type="button"
                  className="w-full h-12 text-sm font-semibold hover:bg-accent hover:text-accent-foreground transition-all active:scale-[0.98]"
                  onClick={() => window.location.href = '/api/connect?plugin=github'}
                >
                  <GithubLogoIcon size={20} className="mr-2 text-foreground" />
                  Connect with GitHub
                </Button>
                <Button 
                  variant="outline" 
                  type="button"
                  className="w-full h-12 text-sm font-semibold hover:bg-accent hover:text-accent-foreground transition-all active:scale-[0.98]"
                >
                  <SlackLogoIcon size={20} className="mr-2 text-fuchsia-500" />
                  Connect with Slack
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      
    </div>
  )
}
