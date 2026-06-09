"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BadgeDollarSign, RotateCcw, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Suit = "S" | "H" | "D" | "C";
type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";
type GameStatus =
  | "idle"
  | "playing"
  | "playerBlackjack"
  | "dealerBlackjack"
  | "playerBust"
  | "dealerBust"
  | "playerWin"
  | "dealerWin"
  | "push";

type CardModel = {
  rank: Rank;
  suit: Suit;
};

type Scoreboard = {
  playerWins: number;
  dealerWins: number;
  pushes: number;
  rounds: number;
};

type GameState = {
  deck: CardModel[];
  dealerHand: CardModel[];
  playerHand: CardModel[];
  status: GameStatus;
  message: string;
  stats: Scoreboard;
  log: string[];
};

const SUITS: Array<{ value: Suit; label: string; tone: "red" | "black" }> = [
  { value: "S", label: "Spades", tone: "black" },
  { value: "H", label: "Hearts", tone: "red" },
  { value: "D", label: "Diamonds", tone: "red" },
  { value: "C", label: "Clubs", tone: "black" },
];

const RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

const initialStats: Scoreboard = {
  playerWins: 0,
  dealerWins: 0,
  pushes: 0,
  rounds: 0,
};

const initialGameState: GameState = {
  deck: [],
  dealerHand: [],
  playerHand: [],
  status: "idle",
  message: "Deal a fresh hand to start the table.",
  stats: initialStats,
  log: ["Dealer stands on 17. Blackjack pays instant bragging rights."],
};

function createDeck() {
  return SUITS.flatMap((suit) => RANKS.map((rank) => ({ rank, suit: suit.value })));
}

function shuffleDeck(deck: CardModel[]) {
  const shuffled = [...deck];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function getCardValue(rank: Rank) {
  if (rank === "A") return 11;
  if (["J", "Q", "K"].includes(rank)) return 10;
  return Number(rank);
}

function getHandValue(hand: CardModel[]) {
  let total = hand.reduce((sum, card) => sum + getCardValue(card.rank), 0);
  let aces = hand.filter((card) => card.rank === "A").length;

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  const hasSoftAce = hand.some((card) => card.rank === "A") && total + 10 <= 21;
  return { total, isSoft: hasSoftAce };
}

function isBlackjack(hand: CardModel[]) {
  return hand.length === 2 && getHandValue(hand).total === 21;
}

function formatCard(card: CardModel) {
  return `${card.rank}${card.suit}`;
}

function completeRound(stats: Scoreboard, status: GameStatus): Scoreboard {
  return {
    rounds: stats.rounds + 1,
    playerWins:
      status === "playerBlackjack" || status === "dealerBust" || status === "playerWin"
        ? stats.playerWins + 1
        : stats.playerWins,
    dealerWins:
      status === "dealerBlackjack" || status === "playerBust" || status === "dealerWin"
        ? stats.dealerWins + 1
        : stats.dealerWins,
    pushes: status === "push" ? stats.pushes + 1 : stats.pushes,
  };
}

function resolveStand(playerHand: CardModel[], dealerHand: CardModel[], deck: CardModel[]) {
  const nextDealerHand = [...dealerHand];
  let nextDeck = [...deck];
  const dealerDraws: string[] = [];

  while (getHandValue(nextDealerHand).total < 17) {
    const nextCard = nextDeck[0];
    nextDeck = nextDeck.slice(1);

    if (!nextCard) break;

    nextDealerHand.push(nextCard);
    dealerDraws.push(`Dealer draws ${formatCard(nextCard)}.`);
  }

  const playerTotal = getHandValue(playerHand).total;
  const dealerTotal = getHandValue(nextDealerHand).total;

  if (dealerTotal > 21) {
    return {
      dealerHand: nextDealerHand,
      deck: nextDeck,
      status: "dealerBust" as const,
      message: `Dealer busts with ${dealerTotal}. You win.`,
      dealerDraws,
    };
  }

  if (playerTotal > dealerTotal) {
    return {
      dealerHand: nextDealerHand,
      deck: nextDeck,
      status: "playerWin" as const,
      message: `You hold ${playerTotal} against dealer ${dealerTotal}. You win.`,
      dealerDraws,
    };
  }

  if (dealerTotal > playerTotal) {
    return {
      dealerHand: nextDealerHand,
      deck: nextDeck,
      status: "dealerWin" as const,
      message: `Dealer has ${dealerTotal} against your ${playerTotal}. Dealer wins.`,
      dealerDraws,
    };
  }

  return {
    dealerHand: nextDealerHand,
    deck: nextDeck,
    status: "push" as const,
    message: `Both hands land on ${playerTotal}. Push.`,
    dealerDraws,
  };
}

function dealRound(stats: Scoreboard): GameState {
  const deck = shuffleDeck(createDeck());
  const playerHand = [deck[0], deck[2]];
  const dealerHand = [deck[1], deck[3]];
  const remainingDeck = deck.slice(4);
  const playerHasBlackjack = isBlackjack(playerHand);
  const dealerHasBlackjack = isBlackjack(dealerHand);
  const openingLog = [
    `You receive ${formatCard(playerHand[0])} and ${formatCard(playerHand[1])}.`,
    `Dealer shows ${formatCard(dealerHand[0])}.`,
  ];

  if (playerHasBlackjack && dealerHasBlackjack) {
    return {
      deck: remainingDeck,
      dealerHand,
      playerHand,
      status: "push",
      message: "Double blackjack. Push.",
      stats: completeRound(stats, "push"),
      log: ["Both players reveal blackjack.", ...openingLog],
    };
  }

  if (playerHasBlackjack) {
    return {
      deck: remainingDeck,
      dealerHand,
      playerHand,
      status: "playerBlackjack",
      message: "Blackjack. You win the hand.",
      stats: completeRound(stats, "playerBlackjack"),
      log: ["Natural 21 on the deal.", ...openingLog],
    };
  }

  if (dealerHasBlackjack) {
    return {
      deck: remainingDeck,
      dealerHand,
      playerHand,
      status: "dealerBlackjack",
      message: "Dealer has blackjack.",
      stats: completeRound(stats, "dealerBlackjack"),
      log: ["Dealer flips a natural 21.", ...openingLog],
    };
  }

  return {
    deck: remainingDeck,
    dealerHand,
    playerHand,
    status: "playing",
    message: "Your move: hit or stand.",
    stats,
    log: openingLog,
  };
}

function getSuitMeta(suit: Suit) {
  return SUITS.find((entry) => entry.value === suit) ?? SUITS[0];
}

function PlayingCard({ card, hidden = false }: { card?: CardModel; hidden?: boolean }) {
  if (hidden || !card) {
    return (
      <div className="flex h-32 w-24 items-center justify-center rounded-2xl border border-accent/30 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.28),rgba(10,10,15,0.95))] shadow-[0_16px_40px_rgba(0,0,0,0.28)]">
        <div className="rounded-full border border-accent/40 px-3 py-1 font-display text-xs uppercase tracking-[0.2em] text-accent">
          Hidden
        </div>
      </div>
    );
  }

  const suit = getSuitMeta(card.suit);
  const isRed = suit.tone === "red";

  return (
    <div className="flex h-32 w-24 flex-col justify-between rounded-2xl border border-white/15 bg-slate-50 p-3 text-slate-950 shadow-[0_16px_40px_rgba(0,0,0,0.28)]">
      <div className={cn("font-display text-2xl font-bold", isRed ? "text-rose-600" : "text-slate-950")}>
        {card.rank}
      </div>
      <div className={cn("text-center font-display text-3xl font-black", isRed ? "text-rose-600" : "text-slate-950")}>
        {card.suit}
      </div>
      <div
        className={cn(
          "self-end text-right text-[10px] font-semibold uppercase tracking-[0.18em]",
          isRed ? "text-rose-600" : "text-slate-700"
        )}
      >
        {suit.label}
      </div>
    </div>
  );
}

function HandPanel({
  title,
  subtitle,
  cards,
  total,
  hideHoleCard = false,
}: {
  title: string;
  subtitle: string;
  cards: CardModel[];
  total: string;
  hideHoleCard?: boolean;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center justify-between gap-4 space-y-0 border-b border-border">
        <div>
          <CardTitle>{title}</CardTitle>
          <p className="mt-1 text-sm text-foreground-muted">{subtitle}</p>
        </div>
        <div className="rounded-xl border border-accent/20 bg-accent-muted px-3 py-2 text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">Total</p>
          <p className="font-display text-2xl font-bold text-foreground">{total}</p>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex min-h-32 flex-wrap gap-3">
          {cards.length > 0 ? (
            cards.map((card, index) => (
              <PlayingCard
                key={`${card.rank}-${card.suit}-${index}`}
                card={card}
                hidden={hideHoleCard && index === 1}
              />
            ))
          ) : (
            <div className="flex h-32 w-full items-center justify-center rounded-2xl border border-dashed border-border text-sm text-foreground-subtle">
              Waiting for the deal.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border bg-background-muted/60 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground-subtle">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

export default function BlackjackPage() {
  const [game, setGame] = useState<GameState>(initialGameState);
  const playerValue = useMemo(() => getHandValue(game.playerHand), [game.playerHand]);
  const dealerValue = useMemo(() => getHandValue(game.dealerHand), [game.dealerHand]);
  const visibleDealerValue = useMemo(() => getHandValue(game.dealerHand.slice(0, 1)), [game.dealerHand]);
  const isPlaying = game.status === "playing";
  const hasStarted = game.status !== "idle";
  const winRate =
    game.stats.rounds === 0 ? "0%" : `${Math.round((game.stats.playerWins / game.stats.rounds) * 100)}%`;

  const startRound = () => {
    setGame((current) => dealRound(current.stats));
  };

  const resetTable = () => {
    setGame(initialGameState);
  };

  const hit = () => {
    setGame((current) => {
      if (current.status !== "playing") return current;

      const nextCard = current.deck[0];
      const nextDeck = current.deck.slice(1);

      if (!nextCard) return current;

      const playerHand = [...current.playerHand, nextCard];
      const total = getHandValue(playerHand).total;
      const log = [`You draw ${formatCard(nextCard)}.`, ...current.log].slice(0, 5);

      if (total > 21) {
        return {
          ...current,
          deck: nextDeck,
          playerHand,
          status: "playerBust",
          message: `Bust with ${total}. Dealer wins.`,
          stats: completeRound(current.stats, "playerBust"),
          log,
        };
      }

      return {
        ...current,
        deck: nextDeck,
        playerHand,
        message: total === 21 ? "You have 21. Stand to lock it in." : "Card added. Hit or stand?",
        log,
      };
    });
  };

  const stand = () => {
    setGame((current) => {
      if (current.status !== "playing") return current;

      const result = resolveStand(current.playerHand, current.dealerHand, current.deck);

      return {
        ...current,
        deck: result.deck,
        dealerHand: result.dealerHand,
        status: result.status,
        message: result.message,
        stats: completeRound(current.stats, result.status),
        log: ["You stand.", ...result.dealerDraws, result.message, ...current.log].slice(0, 6),
      };
    });
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-8 md:px-8">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.22),transparent_32%),radial-gradient(circle_at_85%_10%,rgba(227,25,55,0.16),transparent_28%),linear-gradient(180deg,#050508_0%,#090912_100%)]"
        aria-hidden="true"
      />
      <div className="film-grain fixed inset-0 -z-10" aria-hidden="true" />

      <div className="container-main">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to portfolio
            </Link>
          </Button>
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent-muted px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            Interactive lab
          </div>
        </div>

        <section className="mb-8 grid gap-6 lg:grid-cols-[1fr_0.72fr] lg:items-end">
          <div>
            <p className="section-label">Blackjack table</p>
            <h1 className="font-serif text-4xl text-foreground md:text-6xl">
              Beat the dealer without crossing 21.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground-muted md:text-lg">
              A fast, browser-based blackjack game with real deck shuffling, hidden dealer card,
              soft ace scoring, bust detection, dealer draw logic, and table stats.
            </p>
          </div>

          <Card className="gradient-border">
            <CardContent className="p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl border border-accent/25 bg-accent-muted p-3 text-accent">
                  <BadgeDollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-lg font-semibold text-foreground">Table status</p>
                  <p className="text-sm text-foreground-muted">{game.message}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
                <StatCard label="Player wins" value={game.stats.playerWins} />
                <StatCard label="Dealer wins" value={game.stats.dealerWins} />
                <StatCard label="Pushes" value={game.stats.pushes} />
                <StatCard label="Win rate" value={winRate} />
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_20rem]">
          <div className="space-y-6">
            <HandPanel
              title="Dealer"
              subtitle={isPlaying ? "Hole card stays hidden until you stand." : "Dealer hand revealed."}
              cards={game.dealerHand}
              total={
                isPlaying && game.dealerHand.length > 1
                  ? `${visibleDealerValue.total}+`
                  : dealerValue.isSoft
                    ? `${dealerValue.total} soft`
                    : `${dealerValue.total}`
              }
              hideHoleCard={isPlaying}
            />

            <HandPanel
              title="Player"
              subtitle="Hit for another card or stand to let the dealer play."
              cards={game.playerHand}
              total={
                hasStarted
                  ? playerValue.isSoft
                    ? `${playerValue.total} soft`
                    : `${playerValue.total}`
                  : "0"
              }
            />
          </div>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Controls</CardTitle>
                <p className="text-sm text-foreground-muted">Deal a hand, hit, stand, or reset the session.</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={startRound}>
                  {isPlaying || !hasStarted ? "Deal hand" : "Next hand"}
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={hit} disabled={!isPlaying}>
                    Hit
                  </Button>
                  <Button variant="outline" onClick={stand} disabled={!isPlaying}>
                    Stand
                  </Button>
                </div>
                <Button variant="ghost" className="w-full" onClick={resetTable}>
                  <RotateCcw className="h-4 w-4" />
                  Reset table
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-accent" />
                  Rules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm leading-relaxed text-foreground-muted">
                  <li>Get closer to 21 than the dealer without busting.</li>
                  <li>Face cards count as 10. Aces count as 11 or 1.</li>
                  <li>Dealer draws until 17 and then stands.</li>
                  <li>Natural blackjack ends the round immediately.</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hand log</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-sm text-foreground-muted">
                  {game.log.map((entry, index) => (
                    <li key={`${entry}-${index}`} className="rounded-xl border border-border bg-background-muted/60 p-3">
                      {entry}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </aside>
        </section>
      </div>
    </main>
  );
}
