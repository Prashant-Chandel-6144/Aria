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
    <div className={cn("flex flex-col gap-6 min-h-screen g-gradient-to-b from-background to-muted/20 items-center justify-center p-4", className)} {...props}>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold">Welcome back</CardTitle>
          <CardDescription className="text-base">
            Login with your Apple or Google account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup className="space-y-3">
              <Field className="space-y-3">
                <Button 
                  variant="outline" 
                  type="button"
                  className="w-full h-12 text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <EnvelopeSimpleIcon size={20} className="mr-2" />
                  Connect with Gmail
                </Button>
                <Button 
                  variant="outline" 
                  type="button"
                  className="w-full h-12 text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <CalendarDays size={20} className="mr-2" />
                  Connect with Google Calendar
                </Button>
                <Button 
                  variant="outline" 
                  type="button"
                  className="w-full h-12 text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <GithubLogoIcon size={20} className="mr-2" />
                  Connect with GitHub
                </Button>
                <Button 
                  variant="outline" 
                  type="button"
                  className="w-full h-12 text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <SlackLogoIcon size={20} className="mr-2" />
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
