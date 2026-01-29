import { useCallback } from 'react';
import { useAgentStore } from '@/lib/stores/agent-store';
import { useChatStore } from '@/lib/stores/chat-store';

export function useAgentLoop() {
  const { setState, setIsProcessing, setPlan, addLog, setReport, reset } = useAgentStore();
  const { appendToLastMessage } = useChatStore();

  const runAgentLoop = useCallback(async (userRequest: string) => {
    try {
      setIsProcessing(true);
      setState('ANALYZING');
      addLog('Analyzing request...');
      
      const analyzeResponse = await fetch('/api/ai/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase: 'analyze',
          userRequest,
          context: {
            fileStructure: [], // TODO: Get actual file structure
          },
        }),
      });

      if (!analyzeResponse.ok) {
        throw new Error(`Analysis failed: ${analyzeResponse.statusText}`);
      }

      const analyzeReader = analyzeResponse.body?.getReader();
      const analyzeDecoder = new TextDecoder();
      let analyzeContent = '';

      if (analyzeReader) {
        while (true) {
          const { done, value } = await analyzeReader.read();
          if (done) break;
          
          const chunk = analyzeDecoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  analyzeContent += parsed.content;
                  appendToLastMessage(parsed.content);
                }
                if (parsed.done && parsed.fullContent) {
                  analyzeContent = parsed.fullContent;
                }
              } catch {
                // Skip malformed JSON
              }
            }
          }
        }
      }

      let analysis;
      try {
        // Try to extract JSON from the response
        const jsonMatch = analyzeContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        }
      } catch {
        addLog('Warning: Could not parse analysis JSON');
      }

      // Phase 2: Plan
      setState('PLANNING');
      addLog('Creating execution plan...');
      
      const planResponse = await fetch('/api/ai/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase: 'plan',
          userRequest,
          analysis,
          context: {
            fileStructure: [],
          },
        }),
      });

      if (!planResponse.ok) {
        throw new Error(`Planning failed: ${planResponse.statusText}`);
      }

      const planReader = planResponse.body?.getReader();
      const planDecoder = new TextDecoder();
      let planContent = '';

      if (planReader) {
        while (true) {
          const { done, value } = await planReader.read();
          if (done) break;
          
          const chunk = planDecoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  planContent += parsed.content;
                  appendToLastMessage(parsed.content);
                }
                if (parsed.done && parsed.fullContent) {
                  planContent = parsed.fullContent;
                }
              } catch {
                // Skip malformed JSON
              }
            }
          }
        }
      }

      let plan;
      try {
        const jsonMatch = planContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          plan = JSON.parse(jsonMatch[0]);
          if (plan.steps) {
            setPlan(plan.steps);
          }
        }
      } catch {
        addLog('Warning: Could not parse plan JSON');
      }

      // Phase 3: Execute
      if (plan?.steps) {
        setState('EXECUTING');
        addLog(`Executing ${plan.steps.length} steps...`);
        
        for (const step of plan.steps) {
          addLog(`Executing step: ${step.title}`);
          
          const executeResponse = await fetch('/api/ai/agent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phase: 'execute',
              userRequest,
              plan,
              step,
              context: {
                fileStructure: [],
              },
            }),
          });

          if (!executeResponse.ok) {
            addLog(`Error executing step: ${step.title}`);
            continue;
          }

          const executeReader = executeResponse.body?.getReader();
          const executeDecoder = new TextDecoder();
          let executeContent = '';

          if (executeReader) {
            while (true) {
              const { done, value } = await executeReader.read();
              if (done) break;
              
              const chunk = executeDecoder.decode(value);
              const lines = chunk.split('\n');
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') continue;
                  
                  try {
                    const parsed = JSON.parse(data);
                    if (parsed.content) {
                      executeContent += parsed.content;
                      appendToLastMessage(parsed.content);
                    }
                    if (parsed.done && parsed.fullContent) {
                      executeContent = parsed.fullContent;
                    }
                  } catch {
                    // Skip malformed JSON
                  }
                }
              }
            }
          }

          // TODO: Apply file changes from executeContent
          addLog(`Completed step: ${step.title}`);
        }
      }

      // Phase 4: Report
      setState('TESTING');
      addLog('Generating report...');
      
      const reportResponse = await fetch('/api/ai/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase: 'report',
          userRequest,
          plan,
        }),
      });

      if (reportResponse.ok) {
        const reportReader = reportResponse.body?.getReader();
        const reportDecoder = new TextDecoder();
        let reportContent = '';

        if (reportReader) {
          while (true) {
            const { done, value } = await reportReader.read();
            if (done) break;
            
            const chunk = reportDecoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;
                
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.content) {
                    reportContent += parsed.content;
                    appendToLastMessage(parsed.content);
                  }
                  if (parsed.done && parsed.fullContent) {
                    reportContent = parsed.fullContent;
                  }
                } catch {
                  // Skip malformed JSON
                }
              }
            }
          }
        }

        try {
          const jsonMatch = reportContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const report = JSON.parse(jsonMatch[0]);
            setReport(JSON.stringify(report, null, 2));
          } else {
            setReport(reportContent);
          }
        } catch {
          setReport(reportContent);
        }
      }

      setState('COMPLETED');
      setIsProcessing(false);
      addLog('Agent loop completed');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`Error: ${errorMessage}`);
      setState('FAILED');
      setIsProcessing(false);
    }
  }, [setState, setIsProcessing, setPlan, addLog, setReport, appendToLastMessage]);

  const rollback = useCallback(() => {
    reset();
    addLog('Rolled back agent changes');
  }, [reset, addLog]);

  return { runAgentLoop, rollback };
}
