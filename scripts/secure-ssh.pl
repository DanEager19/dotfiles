#!/usr/bin/perl
use strict;
use warnings;

my @str = ('#PermitRootLogin');
open (my $file, '<', "./hi.txt") or die $!;

while ( my $line = <$file> ) {
    if ($line =~ ) {
        print "$line";
    }
}
close( $file );
s/PermitRootLogin.*+$/No/;

my %options = {
    'PermitRootLogin' => 'No'
}