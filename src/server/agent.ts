import { OpenAIAgentsProvider } from '@corsair-dev/mcp';
import { Agent, run, tool } from '@openai/agents';
import { corsair } from './corsair';

const provider = new OpenAIAgentsProvider();
const tools = provider.build({ corsair, tool });

const agent = new Agent({
    name: 'corsair-agent',
    model: 'gpt-4.1-nano',
    instructions:
        'You have access to Corsair tools. Use list_operations to discover available APIs, get_schema to understand required arguments, and run_script to execute them. When referencing resources (like channels), always use their ID, not their name.',
    tools,
});

const result = await run(agent, 'Setup corsair, then list all the drafts mails');
console.log(result.finalOutput);