import { Injectable } from '@nestjs/common';
import { GameType, GameResult } from '../entities/game-result.entity';
import { SOLVE_QUESTIONS } from '../questions/solve-questions.config';
import { SENSE_SCENARIOS } from './scoring.config';

@Injectable()
export class ScoringService {
  calculateGameScore(gameId: GameType, rawResult: any): any {
    switch (gameId) {
      case GameType.SOLVE:
        return this.scoreSolve(rawResult);
      case GameType.SENSE:
        return this.scoreSense(rawResult);
      case GameType.SPRINT:
        return this.scoreSprint(rawResult);
      case GameType.SUPPORT:
        return this.scoreSupport(rawResult);
      case GameType.SYNC:
        return this.scoreSync(rawResult);
      default:
        return {};
    }
  }

  private clamp(val: number): number {
    return Math.max(0, Math.min(100, val));
  }

  private scoreSolve(rawResult: any) {
    const answers = rawResult.answers || []; // array of { questionId, selectedOptionId }
    let correctCount = 0;
    
    for (const ans of answers) {
      const q = SOLVE_QUESTIONS.find(q => q.id === ans.questionId);
      if (q && q.correctOptionId === ans.selectedOptionId) {
        correctCount++;
      }
    }

    const t = rawResult.totalDurationMs || 0;
    const perf = (correctCount / 4 * 0.7) + ((1 - Math.min(t, 25000) / 25000) * 0.3);
    const score = this.clamp(perf * 100);

    return { focus: score * 0.65, explore: score * 0.35, score, correctCount };
  }

  private scoreSense(rawResult: any) {
    const decisions = rawResult.decisions || rawResult.answers || []; // support decisions or answers
    const totals = { focus: 0, explore: 0, energy: 0, social: 0, adapt: 0 };
    let count = 0;

    for (const ans of decisions) {
      const s = SENSE_SCENARIOS.find(sc => sc.id === ans.scenarioId);
      if (s) {
        const optionId = ans.optionId || ans.selectedOptionId;
        const opt = s.options.find(o => o.id === optionId);
        if (opt) {
          totals.focus += opt.vector.focus;
          totals.explore += opt.vector.explore;
          totals.energy += opt.vector.energy;
          totals.social += opt.vector.social;
          totals.adapt += opt.vector.adapt;
          count++;
        }
      }
    }

    if (count === 0) return totals;

    return {
      focus: (totals.focus / count) * 100,
      explore: (totals.explore / count) * 100,
      energy: (totals.energy / count) * 100,
      social: (totals.social / count) * 100,
      adapt: (totals.adapt / count) * 100,
    };
  }

  private scoreSprint(rawResult: any) {
    const avoid = rawResult.obstaclesAvoided || 0;
    const enc = rawResult.obstaclesEncountered || 1;
    const col = rawResult.collectiblesCollected || 0;
    const avail = rawResult.collectiblesAvailable || 1;

    const avoidRatio = avoid / Math.max(enc, 1);
    const collectRatio = col / Math.max(avail, 1);
    const base = (avoidRatio * 0.6 + collectRatio * 0.4);
    
    const energy = this.clamp(base * 100);
    const adapt = this.clamp(base * 100);
    
    return { energy: energy * 0.6, adapt: adapt * 0.4, score: base * 100, rawEnergy: energy, rawAdapt: adapt };
  }

  private scoreSupport(rawResult: any) {
    const completed = rawResult.completed === true;
    const t = rawResult.elapsedMs || 0;
    const rot = rawResult.rotations || 0;

    let score = 0.3;
    if (completed) {
      score = 1 - (t / 25000) * 0.3 + (1 - rot / 50) * 0.3 + 0.4;
    }
    const scaledScore = this.clamp(score * 100);

    return { social: scaledScore * 0.55, focus: scaledScore * 0.45, score: scaledScore };
  }

  private scoreSync(rawResult: any) {
    const pairs = rawResult.pairsMatched || 0;
    const flips = rawResult.flips || 1;
    const mismatches = rawResult.mismatches || 0;

    const matchRatio = pairs / 4;
    const effRatio = 1 - (mismatches / Math.max(flips, 1));
    const score = matchRatio * 0.6 + effRatio * 0.4;
    
    const scaledScore = this.clamp(score * 100);

    return { social: scaledScore * 0.5, adapt: scaledScore * 0.5, score: scaledScore };
  }

  aggregateProfiles(results: GameResult[]): any {
    const solve = this.calculateGameScore(GameType.SOLVE, results.find(r => r.gameId === GameType.SOLVE)?.rawResult || {});
    const sense = this.calculateGameScore(GameType.SENSE, results.find(r => r.gameId === GameType.SENSE)?.rawResult || {});
    const sprint = this.calculateGameScore(GameType.SPRINT, results.find(r => r.gameId === GameType.SPRINT)?.rawResult || {});
    const support = this.calculateGameScore(GameType.SUPPORT, results.find(r => r.gameId === GameType.SUPPORT)?.rawResult || {});
    const sync = this.calculateGameScore(GameType.SYNC, results.find(r => r.gameId === GameType.SYNC)?.rawResult || {});

    const focus = this.clamp(solve.score * 0.5 + sense.focus * 0.2 + support.score * 0.3);
    const explore = this.clamp(solve.score * 0.7 + sense.explore * 0.3);
    const energy = this.clamp((sprint.rawEnergy || 0) * 0.6 + sense.energy * 0.4);
    const social = this.clamp(sense.social * 0.35 + support.score * 0.35 + sync.score * 0.3);
    const adapt = this.clamp((sprint.rawAdapt || 0) * 0.5 + sync.score * 0.3 + sense.adapt * 0.2);

    return { focus, explore, energy, social, adapt };
  }
}
