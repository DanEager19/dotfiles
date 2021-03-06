#!/usr/bin/perl
use strict;
use warnings;
use File::Find;

find( { wanted => \&findFiles, }, $ARGV[0] );

sub findFiles {
    my $filename = $File::Find::name;
    if ( $filename =~ /^.*\.sh.*$/ ) {
        open( DATA, "<", $filename ) or die $!;
        while ( <DATA> ) { print "$filename - $.:$_" if $_ =~ /bash/; };
        close( DATA );
    }
}
