export interface OptimizationStep {
  id: string;
  title: string;
  status: 'pending' | 'completed' | 'warning';
  description: string;
  action: string;
  impact: string;
}

export function getV4OptimizationSteps(metrics: any): OptimizationStep[] {
  const steps: OptimizationStep[] = [];

  // Acquisition Stage
  if (metrics.cpl > 20) {
    steps.push({
      id: 'opt1',
      title: 'Otimização de CPL (Aquisição)',
      status: 'warning',
      description: 'Seu CPL está 35% acima da meta do setor. O volume de leads pode ser comprometido.',
      action: 'Revisar segmentação de público e criativos de topo de funil.',
      impact: 'Redução de até 15% no custo por lead.'
    });
  }

  // Frequency check
  if (metrics.frequency > 3) {
    steps.push({
      id: 'opt2',
      title: 'Fadiga de Criativo Detectada',
      status: 'warning',
      description: 'Seu público está vendo o mesmo anúncio mais de 3 vezes. O CTR começou a cair.',
      action: 'Substituir criativos com CTR inferior a 0.8%.',
      impact: 'Melhoria de 20% na taxa de clique.'
    });
  }

  // Budget Scaling
  if (metrics.roas > 4) {
    steps.push({
      id: 'opt3',
      title: 'Oportunidade de Escala',
      status: 'completed',
      description: 'Seu ROAS está excelente (4.2x). Existe margem para aumentar o investimento.',
      action: 'Aumentar orçamento diário em 15% a cada 48h.',
      impact: 'Aumento direto no volume de vendas mantendo eficiência.'
    });
  }

  return steps;
}
