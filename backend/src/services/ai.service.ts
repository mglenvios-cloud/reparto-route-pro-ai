export class AIService {
  async optimizeRoute(waypoints: { lat: number; lng: number; id: string }[]) {
    const optimized = this.nearestNeighborOptimization(waypoints);
    return {
      optimized,
      savings: this.estimateSavings(waypoints, optimized),
      suggestions: this.generateSuggestions(waypoints.length),
    };
  }

  async detectDelays(routeData: {
    driverId: string;
    routeId: string;
    currentLat: number;
    currentLng: number;
    eta: Date;
    scheduledEnd: Date;
    stops: { lat: number; lng: number; sequence: number }[];
  }) {
    const now = new Date();
    const etaMs = new Date(routeData.eta).getTime();
    const scheduledMs = new Date(routeData.scheduledEnd).getTime();
    const delayMinutes = Math.max(0, (now.getTime() - scheduledMs) / 60000);

    return {
      hasDelay: delayMinutes > 15,
      delayMinutes: Math.round(delayMinutes),
      severity: delayMinutes > 60 ? 'CRITICAL' : delayMinutes > 30 ? 'HIGH' : 'MEDIUM',
      recommendation: delayMinutes > 30
        ? 'Considere reasignar algunas paradas a otro repartidor'
        : 'Continue con la ruta actual',
    };
  }

  async detectIncorrectAddress(address: string, lat: number, lng: number) {
    const anomalies: string[] = [];
    if (!lat || !lng) anomalies.push('Dirección no geocodificable');
    if (address.length < 5) anomalies.push('Dirección demasiado corta');
    if (!address.match(/calle|av|blvd|col|#/i)) anomalies.push('Formato de dirección no estándar');

    return {
      isLikelyIncorrect: anomalies.length > 0,
      anomalies,
      confidence: anomalies.length === 0 ? 'HIGH' : 'MEDIUM',
    };
  }

  async generateAutoReport(data: {
    companyId: string;
    startDate: Date;
    endDate: Date;
    deliveries: any[];
    drivers: any[];
  }) {
    const totalDeliveries = data.deliveries.length;
    const completed = data.deliveries.filter((d: any) => d.status === 'DELIVERED').length;
    const onTime = data.deliveries.filter((d: any) => {
      if (d.status !== 'DELIVERED' || !d.eta || !d.deliveredAt) return false;
      return new Date(d.deliveredAt) <= new Date(d.eta);
    }).length;

    return {
      summary: {
        totalDeliveries,
        completed,
        pending: totalDeliveries - completed,
        onTimeRate: totalDeliveries > 0 ? Math.round((onTime / completed) * 100) : 0,
        completionRate: totalDeliveries > 0 ? Math.round((completed / totalDeliveries) * 100) : 0,
      },
      driverRanking: data.drivers.map((d: any) => ({
        driverId: d.id,
        name: d.name,
        deliveriesCompleted: d.orders?.filter((o: any) => o.status === 'DELIVERED').length || 0,
        avgTime: d.avgDeliveryTime || 0,
      })).sort((a: any, b: any) => b.deliveriesCompleted - a.deliveriesCompleted),
      insights: this.generateInsights(completed, totalDeliveries, onTime),
    };
  }

  async suggestLogisticsImprovements(history: {
    totalRoutes: number;
    avgStopsPerRoute: number;
    totalDistance: number;
    totalDuration: number;
    delayedRoutes: number;
  }) {
    const suggestions: string[] = [];

    if (history.avgStopsPerRoute < 5) {
      suggestions.push('Agrupe más paradas por ruta para mejorar eficiencia');
    }
    if (history.delayedRoutes / history.totalRoutes > 0.3) {
      suggestions.push('Configure ventanas de tiempo más amplias para reducir retrasos');
    }
    if (history.totalDistance / history.totalRoutes > 100) {
      suggestions.push('Considere asignar rutas más pequeñas por zonas');
    }

    return suggestions;
  }

  private nearestNeighborOptimization(points: { lat: number; lng: number; id: string }[]) {
    if (points.length <= 2) return points;
    const unvisited = [...points];
    const optimized = [unvisited.shift()!];

    while (unvisited.length > 0) {
      const last = optimized[optimized.length - 1];
      let nearestIdx = 0;
      let minDist = Infinity;

      unvisited.forEach((p, i) => {
        const d = this.haversine(last.lat, last.lng, p.lat, p.lng);
        if (d < minDist) { minDist = d; nearestIdx = i; }
      });

      optimized.push(unvisited.splice(nearestIdx, 1)[0]);
    }

    return optimized;
  }

  private haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private estimateSavings(original: any[], optimized: any[]) {
    const origDist = this.totalDistance(original);
    const optDist = this.totalDistance(optimized);
    return {
      originalKm: Math.round(origDist),
      optimizedKm: Math.round(optDist),
      savingsKm: Math.round(origDist - optDist),
      savingsPercent: origDist > 0 ? Math.round(((origDist - optDist) / origDist) * 100) : 0,
    };
  }

  private totalDistance(points: { lat: number; lng: number }[]): number {
    let dist = 0;
    for (let i = 1; i < points.length; i++) {
      dist += this.haversine(points[i - 1].lat, points[i - 1].lng, points[i].lat, points[i].lng);
    }
    return dist;
  }

  private generateSuggestions(stopCount: number) {
    const suggestions = [];
    if (stopCount > 20) suggestions.push('Divida esta ruta en rutas más pequeñas');
    if (stopCount < 3) suggestions.push('Combine esta ruta con otra cercana');
    suggestions.push('Programe entregas similares en la misma ventana de tiempo');
    return suggestions;
  }

  private generateInsights(completed: number, total: number, onTime: number) {
    const insights = [];
    if (completed / total > 0.9) insights.push('Alta tasa de finalización. Excelente rendimiento.');
    else if (completed / total < 0.7) insights.push('Baja tasa de finalización. Revise cuellos de botella.');

    if (onTime / completed > 0.85) insights.push('Buena puntualidad en entregas.');
    else insights.push('Tasa de retrasos alta. Considere ajustar horarios.');

    return insights;
  }
}

export const aiService = new AIService();
