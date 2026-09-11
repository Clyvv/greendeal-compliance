import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Stage 7.4 stops here on purpose — this route's next section
 * (requester details, field-selection checkboxes, purpose, submit) is
 * explicitly Stage 7.5's scope, not half-built now. This placeholder
 * exists so the page doesn't just abruptly end after the product
 * summary, and so it's unambiguous to both a user and a future stage
 * exactly what's still missing.
 */
export function PublicContinuePlaceholder() {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle>What happens next</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-500">
          Next, you&rsquo;ll enter your company details, choose exactly which
          compliance fields you need, and state your purpose for
          requesting them. The supplier reviews every request and
          approves only what they choose to share — this link never
          exposes data directly.
        </p>
      </CardContent>
      <CardFooter>
        <Button type="button" disabled title="Coming in Stage 7.5">
          Continue
        </Button>
      </CardFooter>
    </Card>
  );
}
